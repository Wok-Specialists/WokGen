import { NextRequest } from 'next/server';
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = await checkRateLimit(`exa:${ip}`, 20, 60_000);
  if (!rl.allowed) return API_ERRORS.RATE_LIMITED();

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return apiError('Exa API not configured. Add EXA_API_KEY to your environment.', 'NOT_CONFIGURED', 503);

  const body = await req.json().catch(() => null);
  if (!body?.query?.trim()) return API_ERRORS.BAD_REQUEST('query is required');

  const res = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: body.query,
      num_results: body.numResults || 10,
      use_autoprompt: true,
      text: { max_characters: 800 },
      highlights: { num_sentences: 2, highlights_per_url: 1 },
    }),
  });

  if (!res.ok) return API_ERRORS.INTERNAL();
  const data = await res.json();
  return apiSuccess({ results: data.results });
}
