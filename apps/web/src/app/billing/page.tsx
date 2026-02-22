import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { stripe, PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import BillingClient from './_client';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/billing');

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  const currentPlanId = subscription?.planId ?? 'free';
  const stripeEnabled = !!stripe;

  return (
    <BillingClient
      currentPlanId={currentPlanId}
      stripeEnabled={stripeEnabled}
      plans={Object.values(PLANS)}
    />
  );
}
