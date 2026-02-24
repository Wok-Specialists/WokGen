/**
 * Cerebras Inference — world's fastest LLM inference (1600+ tokens/sec)
 * OpenAI-compatible API. Models: llama3.1-8b, llama3.1-70b, llama-4-scout-17b-16e
 * Free tier: 60 req/min, 1M tokens/day
 * Get key: https://cloud.cerebras.ai/
 */

const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions';

export interface CerebrasOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export async function cerebrasChat(
  systemPrompt: string,
  userMessage: string,
  opts: CerebrasOptions = {},
): Promise<{ text: string }> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    const err = new Error('Cerebras requires CEREBRAS_API_KEY. Get free key at https://cloud.cerebras.ai/');
    (err as any).statusCode = 401;
    throw err;
  }

  const { model = 'llama-4-scout-17b-16e', maxTokens = 2048, temperature = 0.7, timeoutMs = 15_000 } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(CEREBRAS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const err = new Error(`Cerebras API error ${res.status}: ${body}`);
      (err as any).statusCode = res.status;
      if (res.status === 402 || res.status === 429) (err as any).skipProvider = true;
      throw err;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('Cerebras returned empty response');
    return { text };
  } finally {
    clearTimeout(timer);
  }
}
