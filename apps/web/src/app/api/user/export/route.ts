/**
 * GET /api/user/export
 *
 * GDPR-compliant data export. Returns a JSON file containing all personal data
 * stored for the authenticated user. Requires an active session.
 *
 * Rate-limited to 1 export per hour per user (to prevent data harvesting).
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const userId = session.user.id;

  // 1 export per hour per user
  const rl = await checkRateLimit(`gdpr-export:${userId}`, 1, 3600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit: you can only request a data export once per hour. Retry in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 3600) } },
    );
  }

  const [user, jobs, subscription, conversations, preferences, sfxJobs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        hdTopUpCredits: true,
        hdMonthlyUsed: true,
        publicGenerationsDefault: true,
        stdGenToday: true,
      },
    }),
    prisma.job.findMany({
      where: { userId },
      select: {
        id: true,
        mode: true,
        tool: true,
        prompt: true,
        provider: true,
        status: true,
        resultUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        planId: true,
        status: true,
        cancelAtPeriodEnd: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
    }),
    prisma.eralConversation.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userPreference.findUnique({
      where: { userId },
      select: {
        pixelPrefs: true,
        businessPrefs: true,
        vectorPrefs: true,
        emojiPrefs: true,
        uiuxPrefs: true,
        voicePrefs: true,
        textPrefs: true,
        updatedAt: true,
      },
    }),
    prisma.sfxJob.findMany({
      where: { userId },
      select: {
        id: true,
        prompt: true,
        durationSeconds: true,
        provider: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0',
    profile: user,
    subscription: subscription ?? null,
    preferences: preferences ?? null,
    generations: {
      total: jobs.length,
      items: jobs,
    },
    eralConversations: {
      total: conversations.length,
      items: conversations,
    },
    sfxJobs: {
      total: sfxJobs.length,
      items: sfxJobs,
    },
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="wokgen-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
