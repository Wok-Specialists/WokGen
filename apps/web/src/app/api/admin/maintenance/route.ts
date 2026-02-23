import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// GET /api/admin/maintenance
//
// Purges stale rows from housekeeping tables that grow unbounded.
// Called daily by Vercel Cron (see vercel.json) with the CRON_SECRET header,
// or manually by an admin authenticated via session.
//
// Cleans:
//   GuestUsage  — rows older than 1 day (date-keyed, so simple date compare)
//   RateLimit   — rows whose reset_at timestamp has passed
// ---------------------------------------------------------------------------

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Accept either CRON_SECRET (from Vercel Cron) or an authenticated admin session
  const authHeader = req.headers.get('authorization');
  const cronOk = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;

  if (!cronOk) {
    // Fallback: allow authenticated admin
    try {
      const { auth } = await import('@/lib/auth');
      const session = await auth();
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!session?.user?.email || session.user.email !== adminEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results: Record<string, number> = {};

  // ── GuestUsage: delete rows older than 1 day ────────────────────────────
  try {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const cutoff = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD

    const { count: guestDeleted } = await prisma.guestUsage.deleteMany({
      where: { date: { lt: cutoff } },
    });
    results.guestUsageDeleted = guestDeleted;
  } catch (err) {
    console.error('[maintenance] guestUsage cleanup failed:', err);
    results.guestUsageError = 1;
  }

  // ── RateLimit: delete rows whose reset_at has passed ────────────────────
  try {
    const nowMs = BigInt(Date.now());
    const { count: rlDeleted } = await prisma.rateLimit.deleteMany({
      where: { reset_at: { lt: nowMs } },
    });
    results.rateLimitDeleted = rlDeleted;
  } catch (err) {
    console.error('[maintenance] rateLimit cleanup failed:', err);
    results.rateLimitError = 1;
  }

  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    ...results,
  });
}
