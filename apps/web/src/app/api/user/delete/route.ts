import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { log as logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// DELETE /api/user/delete — permanently delete the authenticated user's account
export async function DELETE(req: NextRequest) {
  void req; // unused but required by Next.js handler signature
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 3 attempts per hour — prevents abuse of destructive endpoint
  const rl = await checkRateLimit(`user-delete:${session.user.id}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Audit log before destructive delete
    logger.info({ userId: session.user.id, email: session.user.email }, '[AUDIT] user account deletion initiated');
    // Cascade deletes handle jobs, subscriptions, gallery assets, projects, etc.
    await prisma.user.delete({ where: { id: session.user.id } });
    logger.info({ userId: session.user.id }, '[AUDIT] user account deleted');
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, '[DELETE /api/user/delete]');
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

