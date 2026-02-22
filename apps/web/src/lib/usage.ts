import { prisma } from '@/lib/db';

// ---------------------------------------------------------------------------
// Quota check + atomic usage increment for hosted SaaS mode
// ---------------------------------------------------------------------------

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  planId: string;
}

/**
 * Returns whether the user is allowed to generate and how many credits remain.
 * Does NOT increment usage — call incrementUsage() after a successful generation.
 */
export async function checkQuota(userId: string): Promise<QuotaResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  // No subscription at all → treat as free (20/month)
  const limit = subscription?.plan.creditsPerMonth ?? 20;
  const planId = subscription?.planId ?? 'free';

  // Get or create the current UsagePeriod
  const period = await getOrCreateCurrentPeriod(userId);

  const used = period.imagesUsed;
  const remaining = Math.max(0, limit - used);

  return {
    allowed:   used < limit,
    used,
    limit,
    remaining,
    planId,
  };
}

/**
 * Atomically increments usage for the current period.
 * Returns the updated remaining count.
 */
export async function incrementUsage(userId: string): Promise<number> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  const limit = subscription?.plan.creditsPerMonth ?? 20;

  const period = await getOrCreateCurrentPeriod(userId);

  const updated = await prisma.usagePeriod.update({
    where: { id: period.id },
    data: { imagesUsed: { increment: 1 } },
  });

  return Math.max(0, limit - updated.imagesUsed);
}

/**
 * Finds the active usage period for today, or creates it if missing.
 */
async function getOrCreateCurrentPeriod(userId: string) {
  const now = new Date();

  // Find a period whose window contains today
  const existing = await prisma.usagePeriod.findFirst({
    where: {
      userId,
      periodStart: { lte: now },
      periodEnd:   { gte: now },
    },
    orderBy: { periodStart: 'desc' },
  });

  if (existing) return existing;

  // Build a 30-day window starting from today (aligned to calendar day)
  const periodStart = new Date(now);
  periodStart.setHours(0, 0, 0, 0);

  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 30);

  return prisma.usagePeriod.upsert({
    where: {
      userId_periodStart: { userId, periodStart },
    },
    create: {
      userId,
      periodStart,
      periodEnd,
      imagesUsed: 0,
    },
    update: {},
  });
}
