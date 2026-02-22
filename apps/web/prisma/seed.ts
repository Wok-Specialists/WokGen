import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      id:              'free',
      name:            'Free',
      priceUsdCents:   0,
      creditsPerMonth: 0,
      isUnlimitedStd:  true,
      stripePriceId:   null,
    },
    {
      id:              'plus',
      name:            'Plus',
      priceUsdCents:   200,
      creditsPerMonth: 100,
      isUnlimitedStd:  true,
      stripePriceId:   process.env.STRIPE_PRICE_ID_PLUS ?? null,
    },
    {
      id:              'pro',
      name:            'Pro',
      priceUsdCents:   600,
      creditsPerMonth: 500,
      isUnlimitedStd:  true,
      stripePriceId:   process.env.STRIPE_PRICE_ID_PRO ?? null,
    },
    {
      id:              'max',
      name:            'Max',
      priceUsdCents:   1500,
      creditsPerMonth: 2000,
      isUnlimitedStd:  true,
      stripePriceId:   process.env.STRIPE_PRICE_ID_MAX ?? null,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where:  { id: plan.id },
      create: plan,
      update: {
        name:            plan.name,
        priceUsdCents:   plan.priceUsdCents,
        creditsPerMonth: plan.creditsPerMonth,
        isUnlimitedStd:  plan.isUnlimitedStd,
        ...(plan.stripePriceId ? { stripePriceId: plan.stripePriceId } : {}),
      },
    });
    console.log(`✓ Plan seeded: ${plan.id}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
