import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET /api/health
//
// Lightweight health-check endpoint used by:
//   - Docker HEALTHCHECK instructions
//   - Uptime monitors (UptimeRobot, Betterstack, BetterUptime, etc.)
//   - Load balancer probes
//   - CI smoke tests after deployment
//
// Returns 200 OK when the app and database are reachable, 503 otherwise.
//
// Response shape:
// {
//   status:  "ok" | "degraded"
//   version: string          -- from package.json
//   uptime:  number          -- process.uptime() in seconds
//   db:      "ok" | "error"
//   redis:   "ok" | "unavailable" | "error"
//   checks:  Record<string, { ok: boolean; latencyMs?: number; error?: string }>
//   env:     Record<string, boolean>  -- which optional services are configured
//   ts:      string          -- ISO-8601 timestamp
// }
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';

// Never cache the health endpoint — always get a live reading
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VERSION = process.env.npm_package_version ?? '0.1.0';

export async function GET() {
  const startMs = Date.now();
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // --------------------------------------------------------------------------
  // 1. Database ping
  // --------------------------------------------------------------------------
  let dbOk = false;
  const dbStart = Date.now();
  try {
    // Raw SELECT 1 — cheapest possible query that exercises the connection pool
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    checks.database = { ok: true, latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      ok: false,
      latencyMs: Date.now() - dbStart,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // --------------------------------------------------------------------------
  // 2. Redis ping (optional — not a hard failure)
  // --------------------------------------------------------------------------
  let redisStatus: 'ok' | 'unavailable' | 'error' = 'unavailable';
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const redisStart = Date.now();
    try {
      const res = await fetch(`${redisUrl}/ping`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        signal:  AbortSignal.timeout(3000),
      });
      redisStatus = res.ok ? 'ok' : 'error';
      checks.redis = { ok: res.ok, latencyMs: Date.now() - redisStart };
    } catch (err) {
      redisStatus = 'error';
      checks.redis = { ok: false, latencyMs: Date.now() - redisStart, error: (err as Error).message };
    }
  }

  // --------------------------------------------------------------------------
  // 3. Environment check — which optional services are configured
  // --------------------------------------------------------------------------
  const anyProviderKey = Boolean(
    process.env.REPLICATE_API_TOKEN ||
      process.env.FAL_KEY ||
      process.env.TOGETHER_API_KEY,
  );
  const comfyuiHost = process.env.COMFYUI_HOST ?? 'http://127.0.0.1:8188';

  checks.providers = {
    ok: anyProviderKey || Boolean(comfyuiHost),
    // Not a hard failure — ComfyUI is always "configured"
  };

  const env = {
    stripe:      Boolean(process.env.STRIPE_SECRET_KEY),
    redis:       Boolean(redisUrl && redisToken),
    elevenlabs:  Boolean(process.env.ELEVENLABS_API_KEY),
    groq:        Boolean(process.env.GROQ_API_KEY),
    resend:      Boolean(process.env.RESEND_API_KEY),
    sentry:      Boolean(process.env.SENTRY_DSN),
    blobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  };

  // --------------------------------------------------------------------------
  // 4. Overall status
  // --------------------------------------------------------------------------
  const allOk = dbOk;
  const status = allOk ? 'ok' : 'degraded';

  const body = {
    status,
    version:    VERSION,
    uptime:     Math.round(process.uptime()),
    db:         dbOk ? 'ok' : 'error',
    redis:      redisStatus,
    checks,
    env,
    ts:         new Date().toISOString(),
    totalMs:    Date.now() - startMs,
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      // Prevent CDN / reverse-proxy from caching health responses
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma':        'no-cache',
    },
  });
}
