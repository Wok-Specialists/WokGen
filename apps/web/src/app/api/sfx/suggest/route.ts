// POST /api/sfx/suggest
// Converts a visual asset description into an audio/sound effect prompt.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 30;
export const runtime = 'nodejs';

// Rule-based fallback keyword map
const KEYWORD_MAP: [RegExp, string][] = [
  [/fire|flame|burn/i,             'crackling fire, magical flames'],
  [/explo|blast|boom/i,            'explosion impact, debris'],
  [/water|wave|splash|rain/i,      'flowing water, splash'],
  [/sword|blade|weapon|axe|knife/i,'metal clang, whoosh'],
  [/magic|spell|arcane|mana/i,     'magical shimmer, arcane energy'],
  [/footstep|walk|run/i,           'footsteps on stone'],
  [/door|chest|open/i,             'wooden door creak, hinges'],
  [/arrow|bow|projectile/i,        'arrow whoosh, bow release'],
  [/coin|gold|pickup/i,            'coin clink, item pickup'],
  [/level.up|upgrade|power/i,      'level up fanfare, power surge'],
  [/hurt|damage|hit/i,             'impact hit, grunt'],
  [/death|die|defeat/i,            'death sound, defeat sting'],
  [/heal|health|potion/i,          'healing chime, restoration'],
  [/nature|forest|tree/i,          'rustling leaves, birds chirping'],
  [/thunder|lightning|storm/i,     'thunder crack, lightning bolt'],
  [/ghost|spirit|haunt/i,          'ghostly whisper, ethereal tone'],
  [/robot|mech|machine/i,          'mechanical whirr, servo motor'],
  [/portal|teleport|warp/i,        'portal whoosh, teleport zap'],
  [/crystal|gem|jewel/i,           'crystal chime, gem sparkle'],
  [/button|click|ui/i,             'UI click, button press'],
];

function ruleBasedSuggestion(visualPrompt: string, assetType?: string): string {
  const text = `${visualPrompt} ${assetType ?? ''}`;
  for (const [regex, suggestion] of KEYWORD_MAP) {
    if (regex.test(text)) return suggestion;
  }
  return `sound effect for ${visualPrompt.slice(0, 60)}`;
}

export async function POST(req: NextRequest) {
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  const rl  = await checkRateLimit(`sfx-suggest:ip:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: rl.retryAfter },
      { status: 429 },
    );
  }

  let body: { visualPrompt?: unknown; assetType?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const visualPrompt = typeof body.visualPrompt === 'string' ? body.visualPrompt.trim() : '';
  const assetType    = typeof body.assetType    === 'string' ? body.assetType.trim()    : '';

  if (!visualPrompt) {
    return NextResponse.json({ error: 'visualPrompt is required' }, { status: 400 });
  }

  const systemPrompt =
    'You are a sound design expert. Convert visual asset descriptions into concise audio/sound effect descriptions. ' +
    'Be specific and evocative. Keep under 100 characters. No explanation, just the sound description.';
  const userMessage = `Visual: ${visualPrompt}\nAsset type: ${assetType}\nDescribe the matching sound:`;

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 10_000);

  try {
    // ── Try Groq first ──────────────────────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:    'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage  },
          ],
          max_tokens: 60,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const suggestion = data.choices?.[0]?.message?.content?.trim();
        if (suggestion) return NextResponse.json({ suggestion });
      }
    }

    // ── Try Together ────────────────────────────────────────────────────────
    const togetherKey = process.env.TOGETHER_API_KEY;
    if (togetherKey) {
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${togetherKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage  },
          ],
          max_tokens: 60,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const suggestion = data.choices?.[0]?.message?.content?.trim();
        if (suggestion) return NextResponse.json({ suggestion });
      }
    }
  } catch {
    // fall through to rule-based
  } finally {
    clearTimeout(timeout);
  }

  // ── Rule-based fallback ──────────────────────────────────────────────────
  return NextResponse.json({ suggestion: ruleBasedSuggestion(visualPrompt, assetType) });
}
