import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import AccountClient from './_client';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/account');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: { include: { plan: true } },
      usagePeriods: {
        where: {
          periodEnd: { gte: new Date() },
        },
        orderBy: { periodStart: 'desc' },
        take: 1,
      },
    },
  });

  const plan = user?.subscription?.plan;
  const usage = user?.usagePeriods[0];

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
      usage={{
        used:  usage?.imagesUsed ?? 0,
        limit: plan?.creditsPerMonth ?? 20,
      }}
    />
  );
}
