import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProfileClient from './_client';

export const metadata: Metadata = {
  title: 'Profile — WokGen',
  description: 'Your WokGen profile and generation history.',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/profile');

  const userId = session.user.id;

  const [user, subscription, recentJobs, statsRaw] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    }),
    // 6 most recent successful jobs with images
    prisma.job.findMany({
      where: { userId, status: 'succeeded', resultUrl: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, prompt: true, tool: true, mode: true, resultUrl: true, createdAt: true, provider: true },
    }),
    // Aggregate counts
    prisma.job.groupBy({
      by: ['provider'],
      where: { userId },
      _count: { id: true },
    }),
  ]);

  // Count totals
  const totalJobs = statsRaw.reduce((s, g) => s + g._count.id, 0);
  const hdJobs    = statsRaw
    .filter(g => g.provider === 'replicate' || g.provider === 'fal')
    .reduce((s, g) => s + g._count.id, 0);

  const plan      = subscription?.plan;
  const monthlyAlloc     = plan?.creditsPerMonth ?? 0;
  const monthlyUsed      = user?.hdMonthlyUsed   ?? 0;
  const monthlyRemaining = Math.max(0, monthlyAlloc - monthlyUsed);
  const topUp            = user?.hdTopUpCredits  ?? 0;

  return (
    <ProfileClient
      user={{
        id:        userId,
        name:      user?.name  ?? null,
        email:     user?.email ?? null,
        image:     user?.image ?? null,
        createdAt: user?.createdAt?.toISOString() ?? new Date().toISOString(),
      }}
      plan={plan ? {
        id:   plan.id,
        name: plan.name,
      } : null}
      hdCredits={{ monthlyAlloc, monthlyUsed, monthlyRemaining, topUp }}
      stats={{ total: totalJobs, hd: hdJobs, standard: totalJobs - hdJobs }}
      recentJobs={recentJobs.map(j => ({
        id:        j.id,
        prompt:    j.prompt,
        tool:      j.tool,
        mode:      j.mode ?? 'pixel',
        resultUrl: j.resultUrl ?? '',
        createdAt: j.createdAt.toISOString(),
        isHD:      j.provider === 'replicate' || j.provider === 'fal',
      }))}
    />
  );
}
