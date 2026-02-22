import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY env var is required in production');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    })
  : null;

// ---------------------------------------------------------------------------
// Plan definitions — must match Plan rows seeded in DB
// ---------------------------------------------------------------------------

export const PLANS = {
  free: {
    id:             'free',
    name:           'Free',
    priceUsdCents:  0,
    creditsPerMonth: 20,
    stripePriceId:  process.env.STRIPE_PRICE_ID_FREE ?? null,
  },
  pro: {
    id:             'pro',
    name:           'Pro',
    priceUsdCents:  900,
    creditsPerMonth: 200,
    stripePriceId:  process.env.STRIPE_PRICE_ID_PRO ?? null,
  },
  studio: {
    id:             'studio',
    name:           'Studio',
    priceUsdCents:  2900,
    creditsPerMonth: 500,
    stripePriceId:  process.env.STRIPE_PRICE_ID_STUDIO ?? null,
  },
} as const;

export type PlanId = keyof typeof PLANS;
