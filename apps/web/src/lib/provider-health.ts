/**
 * Provider health tracker — circuit-breaker for image generation providers.
 *
 * Skips providers that have recorded ≥MAX_FAILURES errors within WINDOW_MS.
 * Uses Upstash Redis for shared state across Vercel instances (with in-memory fallback).
 *
 * Primary:  Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 * Fallback: In-memory Map (per-instance; acceptable since this is only a hint,
 *           not a correctness guarantee — the cost of a false negative is just
 *           one extra failed request before the provider is skipped)
 */

const WINDOW_MS   = 60_000; // 60-second window
const MAX_FAILURES = 3;
const KEY_PREFIX  = 'wokgen:pfail:';

// ─── In-memory fallback ────────────────────────────────────────────────────

const _memStore = new Map<string, { count: number; resetAt: number }>();

// ─── Redis client (lazy init) ──────────────────────────────────────────────

let _redis: {
  incrby: (key: string, amount: number) => Promise<number>;
  expire:  (key: string, seconds: number) => Promise<number>;
  get:     (key: string) => Promise<string | null>;
} | null | undefined = undefined;

function getRedis() {
  if (_redis !== undefined) return _redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) { _redis = null; return null; }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis');
    _redis = new Redis({ url, token });
    return _redis;
  } catch {
    _redis = null;
    return null;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/** Record a provider failure. Increments the counter in Redis (or memory). */
export async function recordProviderFailure(provider: string): Promise<void> {
  const redis = getRedis();
  const key = KEY_PREFIX + provider;

  if (redis) {
    try {
      const count = await redis.incrby(key, 1);
      if (count === 1) {
        // First failure in the window — set expiry
        await redis.expire(key, Math.ceil(WINDOW_MS / 1000));
      }
      return;
    } catch {
      // Fall through to memory
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = _memStore.get(provider);
  if (!entry || now > entry.resetAt) {
    _memStore.set(provider, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

/** Returns true if the provider has failed too many times recently. */
export async function isProviderThrottled(provider: string): Promise<boolean> {
  const redis = getRedis();
  const key = KEY_PREFIX + provider;

  if (redis) {
    try {
      const val = await redis.get(key);
      return val !== null && Number(val) >= MAX_FAILURES;
    } catch {
      // Fall through to memory
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = _memStore.get(provider);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_FAILURES;
}
