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

    // ── Reserve 1 HD credit atomically (prevents parallel-request race) ──────
    // Attempt to deduct from monthly allocation first, then top-up bank.
    // If both are 0, reject immediately. If generation fails, we refund below.
    let usedMonthly = false;
    try {
      const sub = await prisma.subscription.findUnique({
        where: { userId: authedUserId }, include: { plan: true },
      });
      const monthlyAlloc = sub?.plan?.creditsPerMonth ?? 0;

      // Try to atomically increment hdMonthlyUsed only if still under allocation
      const updated = await prisma.user.updateMany({
        where: {
          id:            authedUserId,
          hdMonthlyUsed: { lt: monthlyAlloc },
        },
        data: { hdMonthlyUsed: { increment: 1 } },
      });

      if (updated.count > 0) {
        usedMonthly = true;
      } else {
        // Monthly exhausted — try top-up bank
        const topUpUpdated = await prisma.user.updateMany({
          where: { id: authedUserId, hdTopUpCredits: { gt: 0 } },
          data:  { hdTopUpCredits: { decrement: 1 } },
        });
        if (topUpUpdated.count === 0) {
          return NextResponse.json(
            { error: 'Insufficient credits', creditsRequired: 1, creditsAvailable: 0 },
            { status: 402 },
          );
        }
      }
    } catch (reserveErr) {
      console.error('[voice/generate] Credit reservation error:', reserveErr);
      return NextResponse.json({ error: 'Could not reserve credits' }, { status: 500 });
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

      // Credit was already reserved above — just return remaining balance info
      const freshUser = await prisma.user.findUnique({ where: { id: authedUserId } }).catch(() => null);
      const hdCreditsRemaining = (freshUser?.hdTopUpCredits ?? 0);

      return NextResponse.json({
        audioBase64:      base64,
        format:           'wav',
        durationEstimate: Math.ceil(text.split(/\s+/).length / 3),
        creditsUsed:      1,
        hdCreditsRemaining,
      });
    } catch (err) {
      // Refund the reserved credit on failure
      try {
        if (usedMonthly) {
          await prisma.user.update({ where: { id: authedUserId }, data: { hdMonthlyUsed: { decrement: 1 } } });
        } else {
          await prisma.user.update({ where: { id: authedUserId }, data: { hdTopUpCredits: { increment: 1 } } });
        }
      } catch (refundErr) {
        console.error('[voice/generate] Credit refund failed:', refundErr);
      }
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
