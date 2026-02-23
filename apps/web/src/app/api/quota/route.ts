import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getQuotaStatus, getUserPlanId } from '@/lib/quota';

export const runtime = 'nodejs';

/**
 * GET /api/quota
 *
 * Returns the caller's current standard-generation quota for today.
 * Used by studio pages to display the "X / Y generations remaining" badge.
 *
 * Response shape:
 *   { used, limit, remaining, tier, resetsIn }
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId  = session?.user?.id ?? null;

    const clientIP =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    const planId = userId ? await getUserPlanId(userId) : 'guest';
    const status = await getQuotaStatus(userId, clientIP, planId);

    // Compute seconds until next UTC midnight
    const now      = Date.now();
    const midnight = new Date();
    midnight.setUTCHours(24, 0, 0, 0);
    const resetsIn = Math.ceil((midnight.getTime() - now) / 1000);

    return NextResponse.json({
      ...status,
      resetsIn,
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[quota] GET failed:', err);
    return NextResponse.json({ error: 'Failed to fetch quota' }, { status: 500 });
  }
}
