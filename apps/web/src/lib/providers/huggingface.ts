/**
 * Hugging Face Inference API provider — free tier, no billing required.
 *
 * Requires a free HF account token (Read access):
 *   https://huggingface.co/settings/tokens
 *
 * Primary model: black-forest-labs/FLUX.1-schnell (fast, high quality)
 * Fallback model: stabilityai/stable-diffusion-xl-base-1.0
 *
 * API: POST https://api-inference.huggingface.co/models/{model}
 *      Authorization: Bearer {HF_TOKEN}
 *      Returns: binary PNG image
 */

import type { ProviderConfig, GenerateParams, GenerateResult, ProviderError } from './types';
import { STYLE_PRESET_TOKENS } from './types';

const HF_BASE = 'https://api-inference.huggingface.co/models';

/** With token: FLUX.1-schnell — fast, high quality (gated, requires free HF account) */
const AUTHED_MODEL    = 'black-forest-labs/FLUX.1-schnell';
/** Without token: SDXL-Turbo — public, no auth needed, works anonymously */
const ANON_MODEL      = 'stabilityai/sdxl-turbo';

export async function huggingfaceGenerate(
  params: GenerateParams,
  config: ProviderConfig,
): Promise<GenerateResult> {
  const t0 = Date.now();

  // Use FLUX.1-schnell when authenticated, sdxl-turbo for anonymous access
  const hasToken = Boolean(config.apiKey);
  const model    = (params.modelOverride as string | undefined)
    ?? (hasToken ? AUTHED_MODEL : ANON_MODEL);

  const prompt = buildPrompt(params);
  const seed   = params.seed != null && params.seed > 0
    ? params.seed
    : Math.floor(Math.random() * 2_147_483_647);

  const width  = snapSize(params.width  ?? 512);
  const height = snapSize(params.height ?? 512);

  const steps = model.includes('schnell') ? 4
    : model.includes('turbo') ? 1
    : 20;

  const body: Record<string, unknown> = {
    inputs: prompt,
    parameters: {
      num_inference_steps: steps,
      width,
      height,
      seed,
      ...(params.negPrompt && hasToken ? { negative_prompt: params.negPrompt } : {}),
    },
    options: { wait_for_model: true },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'image/png,image/jpeg,*/*',
  };
  if (hasToken) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const timeoutMs  = config.timeoutMs ?? 120_000;
  const controller = new AbortController();
  const tid        = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${HF_BASE}/${model}`, {
      method:  'POST',
      headers,
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });
  } finally {
    clearTimeout(tid);
  }

  // If FLUX.1-schnell fails (gated auth issue or cold start), fall back to ANON_MODEL
  if (!res.ok && model === AUTHED_MODEL) {
    const fallbackController = new AbortController();
    const fallbackTid = setTimeout(() => fallbackController.abort(), timeoutMs);
    try {
      res = await fetch(`${HF_BASE}/${ANON_MODEL}`, {
        method:  'POST',
        headers,
        body:    JSON.stringify({
          ...body,
          parameters: { ...body.parameters as object, num_inference_steps: 1 },
        }),
        signal:  fallbackController.signal,
      });
    } finally {
      clearTimeout(fallbackTid);
    }
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const txt = await res.text();
      const j = JSON.parse(txt);
      detail = j?.error ?? txt.slice(0, 200);
    } catch { /* ignore */ }
    const err = new Error(`HuggingFace API error: ${detail}`) as ProviderError;
    err.provider   = 'huggingface';
    err.statusCode = res.status;
    throw err;
  }

  // Response is raw binary image bytes
  const contentType = res.headers.get('content-type') ?? 'image/png';
  const buffer      = await res.arrayBuffer();
  const base64      = Buffer.from(buffer).toString('base64');
  const mimeType    = contentType.split(';')[0].trim();
  const resultUrl   = `data:${mimeType};base64,${base64}`;

  return {
    provider:     'huggingface',
    resultUrl,
    durationMs:   Date.now() - t0,
    resolvedSeed: seed,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPrompt(params: GenerateParams): string {
  const presetTokens = params.stylePreset
    ? STYLE_PRESET_TOKENS[params.stylePreset]
    : '';
  return [
    'pixel art, game asset, crisp pixel edges, limited color palette',
    presetTokens,
    params.prompt.trim(),
  ]
    .filter(Boolean)
    .join(', ');
}

/** Snap to nearest 64 within [64, 1024] — HF models work best on even multiples */
function snapSize(n: number): number {
  return Math.max(64, Math.min(1024, Math.round(n / 64) * 64));
}
