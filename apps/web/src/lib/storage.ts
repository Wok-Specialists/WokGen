/**
 * Image persistence layer.
 *
 * Fetches a provider-generated image URL and saves it to Vercel Blob for
 * permanent storage. Falls back to the original URL if BLOB_READ_WRITE_TOKEN
 * is not set or if the upload fails.
 *
 * Why: Provider CDN URLs (Replicate, Together, Pollinations) expire or rotate.
 * Without persistence, gallery images break within days.
 *
 * Usage:
 *   const persistedUrl = await persistImage(transientUrl, { folder: 'pixel', jobId });
 */

import type { PutBlobResult } from '@vercel/blob';

export interface PersistOptions {
  /** Sub-folder within the blob store, e.g. "pixel" or "business" */
  folder?: string;
  /** Used to build a stable filename */
  jobId?: string;
}

/**
 * Persist an image from a transient URL to Vercel Blob.
 * Returns the persistent URL on success, or the original URL on failure/no-op.
 */
export async function persistImage(
  sourceUrl: string,
  opts: PersistOptions = {},
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return sourceUrl; // no-op: Vercel Blob not configured

  // Skip if already a blob.vercel-storage.com URL
  if (sourceUrl.includes('blob.vercel-storage.com')) return sourceUrl;

  // Skip data: URIs — these are already embedded
  if (sourceUrl.startsWith('data:')) return sourceUrl;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { put } = require('@vercel/blob') as { put: (pathname: string, body: Blob | Buffer, opts: object) => Promise<PutBlobResult> };

    const ext = guessExtension(sourceUrl);
    const folder = opts.folder ?? 'assets';
    const filename = opts.jobId
      ? `${folder}/${opts.jobId}${ext}`
      : `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const imageRes = await fetch(sourceUrl, { signal: AbortSignal.timeout(20_000) });
    if (!imageRes.ok) return sourceUrl;

    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const contentType = imageRes.headers.get('content-type') ?? 'image/png';

    const result = await put(filename, buffer, {
      access:      'public',
      contentType,
      token,
      addRandomSuffix: !opts.jobId,
    });

    return result.url;
  } catch (err) {
    // Log but don't block the generation response
    console.warn('[storage] persistImage failed, using original URL:', (err as Error).message);
    return sourceUrl;
  }
}

function guessExtension(url: string): string {
  const path = new URL(url).pathname;
  if (path.endsWith('.webp')) return '.webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return '.jpg';
  if (path.endsWith('.gif')) return '.gif';
  return '.png';
}
