/**
 * Plan limits — workspace/project count caps per subscription tier.
 * Called by /api/workspaces before creating new projects.
 */

import { prisma } from '@/lib/db';

const PLAN_WORKSPACE_LIMITS: Record<string, number> = {
  free: 3,
  plus: 10,
  pro:  25,
  max:  50,
};

/** Returns the max number of workspaces allowed per mode for this user. */
export async function getWorkspaceLimit(userId: string): Promise<number> {
  const subscription = await prisma.subscription.findUnique({
    where:   { userId },
    include: { plan: true },
  });
  const planId = subscription?.plan?.id ?? 'free';
  return PLAN_WORKSPACE_LIMITS[planId] ?? PLAN_WORKSPACE_LIMITS.free;
}

/** Returns the plan id for a user (default 'free'). */
export async function getUserPlanId(userId: string): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where:   { userId },
    include: { plan: true },
  });
  return subscription?.plan?.id ?? 'free';
}
