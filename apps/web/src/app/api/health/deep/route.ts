import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET /api/health/deep
//
// Deep dependency health check: database + Redis.
// Returns 200 when all checks pass, 503 when any check fails.
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true, latencyMs: Date.now() - dbStart };
  } catch (e) {
    checks.database = { ok: false, latencyMs: Date.now() - dbStart, error: String(e) };
  }

  // Redis check (Upstash REST API)
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (redisUrl) {
    const redisStart = Date.now();
    try {
      const res = await fetch(`${redisUrl}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN ?? ''}` },
        signal: AbortSignal.timeout(2000),
      });
      checks.redis = { ok: res.ok, latencyMs: Date.now() - redisStart };
    } catch (e) {
      checks.redis = { ok: false, latencyMs: Date.now() - redisStart, error: String(e) };
    }
  }

  const allOk = Object.values(checks).every(c => c.ok);
  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    },
  );
}
