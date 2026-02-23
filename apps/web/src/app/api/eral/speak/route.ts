import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// POST /api/eral/speak
//
// "Talk to Eral" voice endpoint:
//   1. Receives spoken text from the client (WebSpeech API transcript)
//   2. Gets a concise text reply from Groq / Together
//   3. Converts to speech via ElevenLabs streaming TTS
//   4. Returns streaming audio/mpeg  — or fallback JSON if ElevenLabs absent
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions';
const TOGETHER_URL = 'https://api.together.xyz/v1/chat/completions';

const RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

// ─── TTS preprocessing ────────────────────────────────────────────────────────

function preprocessForTTS(text: string): string {
  let t = text
    .replace(/\*\*|[*#`~]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\.{2,}/g, '.')
    .replace(/ {2,}/g, ' ')
    .trim();

  if (t.length <= 500) return t;

  // Truncate at sentence boundary
  const truncated = t.slice(0, 500);
  const lastPeriod = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
  );
  return lastPeriod > 200 ? truncated.slice(0, lastPeriod + 1) : truncated;
}

// ─── Request shape ────────────────────────────────────────────────────────────

interface SpeakRequest {
  message: string;
  conversationId?: string;
  context?: {
    mode?: string;
    tool?: string;
    currentPrompt?: string;
  };
  voiceId?: string;
}

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth (optional — guests allowed) ──────────────────────────────────────
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const rlKey = userId ?? ip;

  // ── Determine user tier ────────────────────────────────────────────────────
  let tier: 'guest' | 'free' | 'plus' | 'pro' | 'max' = 'guest';
  if (userId) {
    try {
      const sub = await prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      });
      const planId = sub?.plan?.id ?? 'free';
      if (['plus', 'pro', 'max', 'free'].includes(planId)) {
        tier = planId as typeof tier;
      } else {
        tier = 'free';
      }
    } catch {
      tier = 'free';
    }
  }

  // ── Per-minute rate limit (shared across Vercel instances via Redis/Postgres) ─
  const minuteMax: Record<string, number> = {
    guest: 2, free: 5, plus: 15, pro: 15, max: 15,
  };
  const rl = await checkRateLimit(`voice:min:${rlKey}`, minuteMax[tier] ?? 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', code: 'RATE_LIMIT' }, { status: 429 });
  }

  // ── Daily voice quota (shared across Vercel instances via Redis/Postgres) ────
  const VOICE_DAILY_LIMIT: Record<string, number> = {
    guest: 2, free: 5, plus: -1, pro: -1, max: -1,
  };
  const dailyLimit = VOICE_DAILY_LIMIT[tier] ?? 5;
  const dailyRl = dailyLimit === -1
    ? { allowed: true }
    : await checkRateLimit(`voice:day:${rlKey}`, dailyLimit, 24 * 60 * 60 * 1000);
  if (!dailyRl.allowed) {
    return NextResponse.json(
      { error: 'Daily voice limit reached', limit: dailyLimit, code: 'VOICE_QUOTA' },
      { status: 429 },
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: SpeakRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, conversationId, context, voiceId } = body;

  if (!message?.trim() || message.trim().length < 1 || message.trim().length > 500) {
    return NextResponse.json(
      { error: 'message must be 1–500 characters' },
      { status: 400 },
    );
  }

  // ── Build system prompt ────────────────────────────────────────────────────
  const systemParts = [
    "You are Eral 7c, WokSpec's AI voice assistant. You are responding via voice, so keep replies concise, conversational, and under 100 words. No markdown, no bullet points, no code blocks — speak naturally.",
  ];
  if (context?.mode) systemParts.push(`The user is currently in the ${context.mode} studio.`);
  if (context?.tool) systemParts.push(`They are working with the ${context.tool} tool.`);
  if (context?.currentPrompt) systemParts.push(`Their current prompt is: ${context.currentPrompt}`);
  const systemPrompt = systemParts.join(' ');

  // ── Call AI provider ───────────────────────────────────────────────────────
  const groqKey     = process.env.GROQ_API_KEY;
  const togetherKey = process.env.TOGETHER_API_KEY;

  let aiUrl: string;
  let aiKey: string;
  let aiModel: string;

  if (groqKey) {
    aiUrl   = GROQ_URL;
    aiKey   = groqKey;
    aiModel = 'llama-3.1-8b-instant';
  } else if (togetherKey) {
    aiUrl   = TOGETHER_URL;
    aiKey   = togetherKey;
    aiModel = 'meta-llama/Llama-3.1-8B-Instruct-Turbo';
  } else {
    return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 });
  }

  let textResponse: string;
  try {
    const aiRes = await fetch(aiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${aiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 150,
        temperature: 0.8,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => aiRes.statusText);
      console.error('[speak] AI provider error:', aiRes.status, errText);
      return NextResponse.json({ error: 'AI provider unavailable' }, { status: 503 });
    }

    const aiData = await aiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
    textResponse = (aiData.choices?.[0]?.message?.content ?? '').trim();
    if (!textResponse) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 503 });
    }
  } catch (err) {
    console.error('[speak] AI fetch failed:', err);
    return NextResponse.json({ error: 'AI provider request failed' }, { status: 503 });
  }

  // ── Resolve conversation ID ────────────────────────────────────────────────
  const convId = conversationId ?? `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // ── Preprocess text for TTS ────────────────────────────────────────────────
  const ttsText = preprocessForTTS(textResponse);

  // ── ElevenLabs TTS ────────────────────────────────────────────────────────
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const resolvedVoiceId = voiceId ?? RACHEL_VOICE_ID;

  const fallbackHeaders = {
    'X-Eral-Response-Text': encodeURIComponent(textResponse),
    'X-Eral-Conversation-Id': convId,
  };

  if (!elevenKey) {
    // Fallback: return text for Web Speech API synthesis
    return NextResponse.json(
      { text: textResponse, fallback: true, conversationId: convId },
      { status: 200, headers: fallbackHeaders },
    );
  }

  let elevenRes: Response;
  try {
    elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenKey,
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: ttsText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
  } catch (err) {
    console.error('[speak] ElevenLabs request failed:', err);
    return NextResponse.json(
      { text: textResponse, fallback: true, conversationId: convId, error: 'TTS unavailable' },
      { status: 200, headers: fallbackHeaders },
    );
  }

  if (!elevenRes.ok) {
    const errText = await elevenRes.text().catch(() => elevenRes.statusText);
    console.error('[speak] ElevenLabs error:', elevenRes.status, errText);
    return NextResponse.json(
      { text: textResponse, fallback: true, conversationId: convId, error: 'TTS provider error' },
      { status: 200, headers: fallbackHeaders },
    );
  }

  // ── Stream audio back ──────────────────────────────────────────────────────
  return new Response(elevenRes.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'X-Eral-Response-Text': encodeURIComponent(textResponse),
      'X-Eral-Conversation-Id': convId,
      'Cache-Control': 'no-cache',
    },
  });
}
