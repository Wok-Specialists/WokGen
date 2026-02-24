/**
 * Vectorizer.AI — convert raster images to clean, scalable SVG vectors
 * API: https://vectorizer.ai/api
 * Key: VECTORIZER_API_ID + VECTORIZER_API_SECRET
 * Free tier: 2 free vectorizations/day
 */
import { NextRequest } from 'next/server';
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api-response';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiId     = process.env.VECTORIZER_API_ID;
  const apiSecret = process.env.VECTORIZER_API_SECRET;

  if (!apiId || !apiSecret) {
    return apiError({
      code: 'NOT_CONFIGURED',
      message: 'Vectorizer.AI credentials not configured. Add VECTORIZER_API_ID and VECTORIZER_API_SECRET. Free at https://vectorizer.ai/',
      status: 503,
    });
  }

  const body = await req.json().catch(() => null);
  if (!body?.imageUrl?.trim()) return apiError(API_ERRORS.BAD_REQUEST);

  // Fetch the source image
  const imgRes = await fetch(body.imageUrl, { signal: AbortSignal.timeout(15_000) });
  if (!imgRes.ok) return apiError({ code: 'IMAGE_FETCH_FAILED', message: 'Could not fetch image from URL', status: 400 });

  const imgBuffer = await imgRes.arrayBuffer();
  const contentType = imgRes.headers.get('content-type') || 'image/png';

  // Submit to Vectorizer.AI
  const formData = new FormData();
  formData.append('image', new Blob([imgBuffer], { type: contentType }), 'image.png');
  formData.append('output.svg.version', 'svg_1_1');
  formData.append('processing.max_colors', '256');

  const credentials = Buffer.from(`${apiId}:${apiSecret}`).toString('base64');
  const vecRes = await fetch('https://vectorizer.ai/api/v1/vectorize', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}` },
    body: formData,
    signal: AbortSignal.timeout(45_000),
  });

  if (!vecRes.ok) {
    const errText = await vecRes.text().catch(() => '');
    return apiError({ code: 'VECTORIZE_ERROR', message: `Vectorizer.AI error: ${errText}`, status: vecRes.status });
  }

  const svgContent = await vecRes.text();
  return apiSuccess({ svg: svgContent, contentType: 'image/svg+xml' });
}
