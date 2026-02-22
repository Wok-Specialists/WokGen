/**
 * Seed script — creates Plan rows required by the billing system.
 * Run: npx prisma db seed
 *      (or it runs automatically after prisma migrate deploy/reset)
 *
 * After creating Stripe products, update stripePriceId values here
 * and re-run this script (it uses upsert — safe to re-run).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      id:              'free',
      name:            'Free',
      priceUsdCents:   0,
      creditsPerMonth: 20,
      stripePriceId:   process.env.STRIPE_PRICE_ID_FREE ?? null,
    },
    {
      id:              'pro',
      name:            'Pro',
      priceUsdCents:   900,
      creditsPerMonth: 200,
      stripePriceId:   process.env.STRIPE_PRICE_ID_PRO ?? null,
    },
    {
      id:              'studio',
      name:            'Studio',
      priceUsdCents:   2900,
      creditsPerMonth: 500,
      stripePriceId:   process.env.STRIPE_PRICE_ID_STUDIO ?? null,
    },
  ] as const;

  for (const plan of plans) {
    await prisma.plan.upsert({
      where:  { id: plan.id },
      create: plan,
      update: {
        name:            plan.name,
        priceUsdCents:   plan.priceUsdCents,
        creditsPerMonth: plan.creditsPerMonth,
        ...(plan.stripePriceId ? { stripePriceId: plan.stripePriceId } : {}),
      },
    });
    console.log(`✓ Plan seeded: ${plan.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
