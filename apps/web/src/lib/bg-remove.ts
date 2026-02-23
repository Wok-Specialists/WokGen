/**
 * Remove background from a PNG using RMBG-1.4 via HuggingFace Inference API.
 * Returns a base64 PNG data URL with alpha channel, or null on failure.
 */
export async function removeBackground(imageUrl: string): Promise<string | null> {
  try {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) return null;

    // Fetch source image as a blob
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imageBuffer = await imgRes.arrayBuffer();

    const res = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/octet-stream',
        Accept: 'image/png',
      },
      body: imageBuffer,
    });

    if (!res.ok) return null;

    const resultBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// BgRemoveResult — typed wrapper with fallback metadata
// ---------------------------------------------------------------------------

export interface BgRemoveResult {
  /** Final image URL (transparent PNG or original if removal failed) */
  url: string;
  /** true = background was removed successfully; false = fallback used */
  bgRemoved: boolean;
  /** Human-readable note when bgRemoved is false (for API consumers) */
  note?: string;
}

/**
 * Attempt background removal via RMBG-1.4.
 * On failure returns the original image with a diagnostic note instead of
 * silently discarding the result — never returns null.
 */
export async function removeBackgroundWithFallback(
  imageUrl: string,
): Promise<BgRemoveResult> {
  const stripped = await removeBackground(imageUrl);
  if (stripped) {
    return { url: stripped, bgRemoved: true };
  }
  return {
    url: imageUrl,
    bgRemoved: false,
    note: !process.env.HF_TOKEN
      ? 'Background removal skipped: set HF_TOKEN to enable RMBG-1.4.'
      : 'Background removal failed; original image returned. The RMBG model may still be loading — try again shortly.',
  };
}
