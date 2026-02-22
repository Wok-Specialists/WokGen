import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  const token = process.env.HF_TOKEN;
  const isSelfHosted = process.env.SELF_HOSTED === 'true';
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN;
  const hasTogether = !!process.env.TOGETHER_API_KEY;
  const hasFal = !!process.env.FAL_KEY;
  const hasHF = !!process.env.HF_TOKEN;

  // Determine what resolvedProvider would be
  const resolvedProvider = isSelfHosted ? 'self-hosted'
    : hasTogether ? 'together'
    : hasFal ? 'fal'
    : hasHF ? 'huggingface'
    : 'pollinations';

  if (!token) {
    return NextResponse.json({ error: 'HF_TOKEN not set', resolvedProvider, isSelfHosted, hasReplicate, hasTogether, hasFal, hasHF });
  }

  try {
    const url = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-use-cache': 'false',
      },
      body: JSON.stringify({
        inputs: 'pixel art warrior',
        parameters: { num_inference_steps: 4, width: 256, height: 256 },
        options: { wait_for_model: true },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = resp.headers.get('content-type') ?? '';
    const status = resp.status;

    if (!resp.ok) {
      const text = await resp.text().catch(() => '(unreadable)');
      return NextResponse.json({
        ok: false, status, contentType,
        error: text,
        resolvedProvider, isSelfHosted, hasReplicate, hasTogether, hasFal, hasHF,
        tokenPrefix: token.slice(0, 8),
      });
    }

    const buf = await resp.arrayBuffer();
    return NextResponse.json({
      ok: true, status, contentType,
      bytes: buf.byteLength,
      resolvedProvider, isSelfHosted, hasReplicate, hasTogether, hasFal, hasHF,
      tokenPrefix: token.slice(0, 8),
    });
  } catch (e: unknown) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      resolvedProvider, isSelfHosted, hasReplicate, hasTogether, hasFal, hasHF,
      tokenPrefix: token?.slice(0, 8),
    });
  }
}
