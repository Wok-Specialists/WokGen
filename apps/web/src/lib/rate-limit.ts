/**
 * Rate limiter — uses Upstash Redis when UPSTASH_REDIS_REST_URL is set,
 * falls back to in-memory sliding window (acceptable for single-instance dev).
 *
 * Upstash is edge-compatible and persists across Vercel serverless instances,
 * fixing the multi-instance bypass issue with the in-memory fallback.
 */

// ─── In-memory fallback (dev / missing env vars) ──────────────────────────

interface Bucket { count: number; resetAt: number }
const store = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, bucket]) => {
    if (bucket.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

function checkInMemory(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (existing.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { allowed: true };
}

// ─── Upstash Redis limiter ─────────────────────────────────────────────────

let upstashLimiter: ((key: string, max: number, windowMs: number) => Promise<{ allowed: boolean; retryAfter?: number }>) | null = null;

function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Lazy import so build doesn't fail if package is absent
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Ratelimit } = require('@upstash/ratelimit');

  const redis = new Redis({ url, token });

  // Cache per-window limiters
  const limiters = new Map<string, ReturnType<typeof Ratelimit>>();

  upstashLimiter = async (key: string, max: number, windowMs: number) => {
    const cacheKey = `${max}:${windowMs}`;
    if (!limiters.has(cacheKey)) {
      limiters.set(cacheKey, new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${windowMs}ms`),
        prefix:  'wokgen:rl',
      }));
    }
    const limiter = limiters.get(cacheKey)!;
    const result  = await limiter.limit(key);
    return result.success
      ? { allowed: true }
      : { allowed: false, retryAfter: Math.ceil((result.reset - Date.now()) / 1000) };
  };

  return upstashLimiter;
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * @returns `{ allowed: true }` when under limit, `{ allowed: false, retryAfter }` when over.
 */
export async function checkRateLimit(
  userId: string,
  maxRequests = 10,
  windowMs = 60_000,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    try {
      return await limiter(userId, maxRequests, windowMs);
    } catch {
      // Upstash unavailable — fall through to in-memory
    }
  }
  return checkInMemory(userId, maxRequests, windowMs);
}
