/**
 * Pollinations.ai provider — completely free, no API key required.
 * Uses the public image generation endpoint backed by FLUX.1-schnell.
 *
 * API: GET https://image.pollinations.ai/prompt/{encoded_prompt}
 *      Returns the image as binary (JPEG/PNG).
 *
 * We fetch the image server-side and return it as a base64 data URL so
 * the client never has to deal with CORS or Pollinations' redirect chain.
 */

import type { ProviderConfig, GenerateParams, GenerateResult } from './types';
import { buildPrompt, buildNegativePrompt } from '../prompt-builder';

const BASE_URL = 'https://image.pollinations.ai/prompt';

export async function pollinationsGenerate(
  params: GenerateParams,
  _config: ProviderConfig,
): Promise<GenerateResult> {
  const t0 = Date.now();

  // Build prompt with central prompt builder
  const fullPrompt = buildPrompt({
    tool: params.tool,
    userPrompt: params.prompt,
    stylePreset: params.stylePreset,
    assetCategory: params.assetCategory,
    pixelEra: params.pixelEra,
    backgroundMode: params.backgroundMode,
    outlineStyle: params.outlineStyle,
    paletteSize: params.paletteSize,
    width: params.width,
    height: params.height,
    lightweight: true, // Pollinations has a URL length limit — use compact tokens
  });
  const negPrompt = buildNegativePrompt({
    assetCategory: params.assetCategory,
    pixelEra: params.pixelEra,
    userNegPrompt: params.negPrompt,
  });

  const width  = params.width  ?? 512;
  const height = params.height ?? 512;
  const seed   = params.seed   ?? Math.floor(Math.random() * 2_147_483_647);

  const url = new URL(`${BASE_URL}/${encodeURIComponent(fullPrompt)}`);
  url.searchParams.set('width',   String(width));
  url.searchParams.set('height',  String(height));
  url.searchParams.set('seed',    String(seed));
  url.searchParams.set('model',   'flux');
  url.searchParams.set('nologo',  'true');
  url.searchParams.set('enhance', 'false');

  // Negative prompt is not natively supported but we can suffix the main prompt
  if (negPrompt) {
    url.searchParams.set('negative_prompt', negPrompt);
  }

  const timeoutMs = _config.timeoutMs ?? 120_000;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  let imageBuffer: ArrayBuffer;
  let contentType: string;

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      // Follow redirects (Pollinations sometimes redirects to CDN)
      redirect: 'follow',
    });

    if (!res.ok) {
      throw Object.assign(
        new Error(`Pollinations returned HTTP ${res.status}`),
        { statusCode: res.status },
      );
    }

    contentType = res.headers.get('content-type') ?? 'image/jpeg';
    imageBuffer = await res.arrayBuffer();
  } finally {
    clearTimeout(timeoutId);
  }

  // Convert to base64 data URL
  const base64 = Buffer.from(imageBuffer).toString('base64');
  const mimeType = contentType.split(';')[0].trim();
  const resultUrl = `data:${mimeType};base64,${base64}`;

  return {
    provider:      'pollinations',
    resultUrl,
    durationMs:    Date.now() - t0,
    resolvedSeed:  seed,
  };
}
