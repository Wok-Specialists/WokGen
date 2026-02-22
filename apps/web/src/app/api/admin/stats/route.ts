import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET() {
  // Guard: must be authenticated AND email must match ADMIN_EMAIL
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ADMIN_EMAIL || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeThisMonth,
    planCounts,
    totalJobs,
    jobsToday,
    hdJobs,
    standardJobs,
    recentJobs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: monthStart }, userId: { not: null } },
    }).then(rows => rows.length),
    prisma.subscription.groupBy({
      by: ['planId'],
      _count: true,
    }),
    prisma.job.count(),
    prisma.job.count({ where: { createdAt: { gte: today } } }),
    prisma.job.count({ where: { provider: 'replicate' } }),
    prisma.job.count({ where: { provider: { not: 'replicate' } } }),
    prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, prompt: true, provider: true, status: true, createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  const byPlan: Record<string, number> = {};
  for (const row of planCounts) {
    byPlan[row.planId] = row._count;
  }

  return NextResponse.json({
    users: {
      total: totalUsers,
      activeThisMonth,
      byPlan,
    },
    jobs: {
      total: totalJobs,
      today: jobsToday,
      hd:       hdJobs,
      standard: standardJobs,
    },
    recentJobs,
    generatedAt: now.toISOString(),
  });
}
