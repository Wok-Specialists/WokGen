import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/usage
 *
 * Returns generation stats for the authenticated user:
 *  - allTime / thisMonth / today counts (total / hd / standard)
 *  - daily breakdown for the last 30 days (for spark-chart)
 *  - last 12 jobs with resultUrl for history strip
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id;
  const now    = new Date();

  // Period boundaries
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all succeeded jobs in the last 30 days (for stats + chart)
  const [recentJobs, allTimeTotal, allTimeHd] = await Promise.all([
    prisma.job.findMany({
      where:   { userId, status: 'succeeded', createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      select:  { id: true, provider: true, createdAt: true, resultUrl: true, prompt: true, tool: true },
    }),
    prisma.job.count({ where: { userId, status: 'succeeded' } }),
    prisma.job.count({ where: { userId, status: 'succeeded', provider: 'replicate' } }),
  ]);

  // Partition into HD vs standard (replicate = HD, everything else = standard)
  const isHd = (provider: string) => provider === 'replicate';

  // Today / this-month counts
  const todayJobs      = recentJobs.filter(j => j.createdAt >= startOfToday);
  const thisMonthJobs  = recentJobs.filter(j => j.createdAt >= startOfMonth);

  // Daily breakdown for last 30 days
  const dailyMap = new Map<string, { total: number; hd: number; standard: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { total: 0, hd: 0, standard: 0 });
  }
  for (const job of recentJobs) {
    const key = job.createdAt.toISOString().slice(0, 10);
    const bucket = dailyMap.get(key);
    if (bucket) {
      bucket.total++;
      if (isHd(job.provider)) bucket.hd++;
      else bucket.standard++;
    }
  }

  const daily = Array.from(dailyMap.entries()).map(([date, counts]) => ({ date, ...counts }));

  return NextResponse.json({
    allTime: {
      total:    allTimeTotal,
      hd:       allTimeHd,
      standard: allTimeTotal - allTimeHd,
    },
    thisMonth: {
      total:    thisMonthJobs.length,
      hd:       thisMonthJobs.filter(j => isHd(j.provider)).length,
      standard: thisMonthJobs.filter(j => !isHd(j.provider)).length,
    },
    today: {
      total:    todayJobs.length,
      hd:       todayJobs.filter(j => isHd(j.provider)).length,
      standard: todayJobs.filter(j => !isHd(j.provider)).length,
    },
    daily,
    // Most recent 12 jobs with images for history strip
    recent: recentJobs.slice(0, 12).map(j => ({
      id:        j.id,
      prompt:    j.prompt,
      tool:      j.tool,
      provider:  j.provider,
      resultUrl: j.resultUrl,
      createdAt: j.createdAt.toISOString(),
      hd:        isHd(j.provider),
    })),
  });
}
