import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// POST /api/voice/generate
//
// Converts text to speech using:
//   Standard tier: HuggingFace hexgrad/Kokoro-82M (falls back to browser TTS hint)
//   HD tier:       Replicate suno-ai/bark
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const maxDuration = 120;

type VoiceType = 'natural' | 'character' | 'whisper' | 'energetic' | 'news' | 'deep';
type Language  = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'pt' | 'zh';

const HF_URL = 'https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M';
const REPLICATE_URL = 'https://api.replicate.com/v1/predictions';
const REPLICATE_BARK_MODEL =
  'suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787';

// Maps WokGen voice types to Bark history_prompt values
const VOICE_PROFILES: Record<VoiceType, string> = {
  natural:   'announcer',
  character: 'v2/en_speaker_3',
  whisper:   'v2/en_speaker_6',
  energetic: 'v2/en_speaker_9',
  news:      'v2/en_speaker_1',
  deep:      'v2/en_speaker_0',
};

export async function POST(req: NextRequest) {
  // ── Auth & rate limit ────────────────────────────────────────────────────
  let authedUserId: string | null = null;
  try {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    authedUserId = session?.user?.id ?? null;
  } catch {
    // auth not available in self-hosted mode — continue as guest
  }

  const rateLimitKey =
    authedUserId ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  // Free: 5/hr  |  Paid: 20/hr (simple: use presence of userId as proxy for paid)
  const maxReqs = authedUserId ? 20 : 5;
  const rl = await checkRateLimit(rateLimitKey, maxReqs, 3600 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: {
    text?: string;
    voice?: VoiceType;
    language?: Language;
    speed?: number;
    tier?: 'standard' | 'hd';
    userId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text     = (body.text ?? '').trim();
  const voice    = (body.voice ?? 'natural') as VoiceType;
  const speed    = Math.max(0.5, Math.min(2.0, body.speed ?? 1.0));
  const tier     = body.tier ?? 'standard';

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'text must be 500 characters or fewer' }, { status: 400 });
  }

  // ── HD tier — Replicate Bark ─────────────────────────────────────────────
  if (tier === 'hd') {
    // HD requires authentication
    if (!authedUserId) {
      return NextResponse.json(
        { error: 'Sign in to use HD voice generation.' },
        { status: 401 },
      );
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json(
        { error: 'HD tier is not configured on this server.' },
        { status: 503 },
      );
    }

    // ── Credit pre-check ────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where:   { id: authedUserId },
      include: { subscription: { include: { plan: true } } },
    });
    const monthlyAllocation = user?.subscription?.plan.creditsPerMonth ?? 0;
    const monthlyUsed       = user?.hdMonthlyUsed ?? 0;
    const monthlyRemaining  = Math.max(0, monthlyAllocation - monthlyUsed);
    const topUpBank         = user?.hdTopUpCredits ?? 0;
    const totalAvailable    = monthlyRemaining + topUpBank;

    if (totalAvailable < 1) {
      return NextResponse.json(
        {
          error:            'Insufficient credits',
          creditsRequired:  1,
          creditsAvailable: 0,
        },
        { status: 402 },
      );
    }

    try {
      const voiceProfile = VOICE_PROFILES[voice] ?? 'announcer';

      const createRes = await fetch(REPLICATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Token ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: REPLICATE_BARK_MODEL.split(':')[1],
          input: {
            prompt: text,
            history_prompt: voiceProfile,
            text_temp: 0.7,
            waveform_temp: 0.7,
          },
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Replicate error ${createRes.status}: ${errText}`);
      }

      const prediction = await createRes.json() as { id: string; status: string; output?: string; urls?: { get: string } };

      // Poll until completion (max 90s)
      const pollUrl = prediction.urls?.get ?? `${REPLICATE_URL}/${prediction.id}`;
      let audioUrl: string | null = null;
      for (let i = 0; i < 45; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes  = await fetch(pollUrl, { headers: { Authorization: `Token ${replicateToken}` } });
        const pollData = await pollRes.json() as { status: string; output?: string; error?: string };
        if (pollData.status === 'succeeded') { audioUrl = pollData.output ?? null; break; }
        if (pollData.status === 'failed')    { throw new Error(pollData.error ?? 'Bark generation failed'); }
      }

      if (!audioUrl) throw new Error('HD generation timed out');

      // Fetch audio and convert to base64
      const audioRes = await fetch(audioUrl);
      const buffer   = await audioRes.arrayBuffer();
      const base64   = Buffer.from(buffer).toString('base64');

      // ── Deduct 1 HD credit on success ──────────────────────────────────────
      let hdCreditsRemaining = 0;
      try {
        const freshUser = await prisma.user.findUnique({ where: { id: authedUserId } });
        const freshSub  = await prisma.subscription.findUnique({
          where:   { userId: authedUserId },
          include: { plan: true },
        });
        const freshMonthlyAlloc = freshSub?.plan?.creditsPerMonth ?? 0;
        const freshMonthlyUsed  = freshUser?.hdMonthlyUsed ?? 0;
        const freshMonthlyRem   = Math.max(0, freshMonthlyAlloc - freshMonthlyUsed);

        if (freshMonthlyRem > 0) {
          await prisma.user.update({
            where: { id: authedUserId },
            data:  { hdMonthlyUsed: { increment: 1 } },
          });
          hdCreditsRemaining = freshMonthlyRem - 1 + (freshUser?.hdTopUpCredits ?? 0);
        } else {
          const updated = await prisma.user.update({
            where: { id: authedUserId },
            data:  { hdTopUpCredits: { decrement: 1 } },
          });
          hdCreditsRemaining = Math.max(0, updated.hdTopUpCredits);
        }
      } catch (dbErr) {
        console.warn('[voice/generate] Failed to deduct HD credit:', (dbErr as Error).message);
      }

      return NextResponse.json({
        audioBase64:      base64,
        format:           'wav',
        durationEstimate: Math.ceil(text.split(/\s+/).length / 3),
        creditsUsed:      1,
        hdCreditsRemaining,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'HD generation failed' },
        { status: 502 },
      );
    }
  }

  // ── Standard tier — HuggingFace Kokoro ───────────────────────────────────
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    // No HF key — instruct client to use browser TTS
    return NextResponse.json({
      fallback: true,
      text,
      speed,
      message: 'Use browser TTS for standard tier',
    });
  }

  try {
    const hfRes = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      // Model loading (503) or other transient error — fall back to browser TTS
      if (hfRes.status === 503 || hfRes.status === 429) {
        return NextResponse.json({
          fallback: true,
          text,
          speed,
          message: 'Use browser TTS for standard tier',
        });
      }
      throw new Error(`HuggingFace error ${hfRes.status}: ${errText}`);
    }

    const buffer = await hfRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return NextResponse.json({
      audioBase64:     base64,
      format:          'wav',
      durationEstimate: Math.ceil(text.split(/\s+/).length / 3),
      creditsUsed:     0,
    });
  } catch (err) {
    // Fall back to browser TTS on any error
    return NextResponse.json({
      fallback: true,
      text,
      speed,
      message: 'Use browser TTS for standard tier',
    });
  }
}
