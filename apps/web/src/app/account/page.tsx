import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import AccountClient from './_client';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/account');

  const user = await prisma.user.findUnique({
    where:   { id: session.user.id },
    include: { subscription: { include: { plan: true } } },
  });

  const plan             = user?.subscription?.plan;
  const monthlyAlloc     = plan?.creditsPerMonth ?? 0;
  const monthlyUsed      = user?.hdMonthlyUsed ?? 0;
  const monthlyRemaining = Math.max(0, monthlyAlloc - monthlyUsed);
  const topUpCredits     = user?.hdTopUpCredits ?? 0;

  return (
    <AccountClient
      user={{
        name:  user?.name  ?? null,
        email: user?.email ?? null,
        image: user?.image ?? null,
      }}
      plan={plan ? {
        id:              plan.id,
        name:            plan.name,
        creditsPerMonth: plan.creditsPerMonth,
      } : null}
      hdCredits={{ monthly: monthlyRemaining, topUp: topUpCredits }}
    />
  );
}
