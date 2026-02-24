// Groq free tier: 30 req/min, 500K tokens/day, no billing needed
// Model: llama-3.3-70b-versatile

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export interface GroqChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

/**
 * Call Groq chat completions API and return `{ text }`.
 * Uses GROQ_API_KEY env var. Throws if key is absent or request fails.
 * Set `skipProvider = true` on 402/credit errors (ProviderError convention).
 */
export async function groqChat(
  systemPrompt: string,
  userMessage: string,
  opts: GroqChatOptions = {},
): Promise<{ text: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err: NodeJS.ErrnoException = new Error(
      'Groq requires GROQ_API_KEY. Get a free key at https://console.groq.com/keys',
    );
    (err as { statusCode?: number }).statusCode = 401;
    throw err;
  }

  const {
    model     = DEFAULT_MODEL,
    maxTokens = 2048,
    temperature = 0.7,
    timeoutMs   = 30_000,
  } = opts;

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system',    content: systemPrompt },
        { role: 'user',      content: userMessage  },
      ],
      max_tokens:  maxTokens,
      temperature,
      stream:      false,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json() as { error?: { message?: string } };
      detail = j?.error?.message ?? detail;
    } catch { /* ignore */ }

    const err: NodeJS.ErrnoException = new Error(`Groq API error: ${detail}`);
    (err as { statusCode?: number; skipProvider?: boolean }).statusCode = res.status;
    if (res.status === 402) {
      (err as { skipProvider?: boolean }).skipProvider = true;
    }
    throw err;
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = (data.choices?.[0]?.message?.content ?? '').trim();
  return { text };
}
