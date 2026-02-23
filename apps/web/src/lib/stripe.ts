import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    })
  : null;

// ---------------------------------------------------------------------------
// Subscription plan definitions — must match Plan rows seeded in DB
// ---------------------------------------------------------------------------

export const PLANS = {
  free: {
    id:              'free',
    name:            'Free',
    priceUsdCents:   0,
    creditsPerMonth: 0,
    isUnlimitedStd:  true,
    stripePriceId:   null as string | null,
    description:     'Unlimited standard generation. Forever free.',
  },
  plus: {
    id:              'plus',
    name:            'Plus',
    priceUsdCents:   200,
    creditsPerMonth: 100,
    isUnlimitedStd:  true,
    stripePriceId:   process.env.STRIPE_PRICE_ID_PLUS ?? null,
    description:     'Unlimited standard + 100 HD credits/month.',
  },
  pro: {
    id:              'pro',
    name:            'Pro',
    priceUsdCents:   600,
    creditsPerMonth: 500,
    isUnlimitedStd:  true,
    stripePriceId:   process.env.STRIPE_PRICE_ID_PRO ?? null,
    description:     'Unlimited standard + 500 HD credits/month.',
  },
  max: {
    id:              'max',
    name:            'Max',
    priceUsdCents:   1500,
    creditsPerMonth: 2000,
    isUnlimitedStd:  true,
    stripePriceId:   process.env.STRIPE_PRICE_ID_MAX ?? null,
    description:     'Unlimited standard + 2,000 HD credits/month.',
  },
} as const;

export type PlanId = keyof typeof PLANS;

// ---------------------------------------------------------------------------
// HD credit top-up packs — one-time purchases, credits never expire
// ---------------------------------------------------------------------------

export const CREDIT_PACKS = {
  micro: {
    id:            'micro',
    name:          'Micro',
    priceUsdCents: 100,
    credits:       30,
    stripePriceId: process.env.STRIPE_PRICE_ID_CREDITS_MICRO ?? null,
    description:   '30 HD credits',
  },
  small: {
    id:            'small',
    name:          'Small',
    priceUsdCents: 300,
    credits:       100,
    stripePriceId: process.env.STRIPE_PRICE_ID_CREDITS_SMALL ?? null,
    description:   '100 HD credits',
  },
  medium: {
    id:            'medium',
    name:          'Medium',
    priceUsdCents: 800,
    credits:       400,
    stripePriceId: process.env.STRIPE_PRICE_ID_CREDITS_MEDIUM ?? null,
    description:   '400 HD credits',
  },
  large: {
    id:            'large',
    name:          'Large',
    priceUsdCents: 2000,
    credits:       1200,
    stripePriceId: process.env.STRIPE_PRICE_ID_CREDITS_LARGE ?? null,
    description:   '1,200 HD credits — best value',
  },
} as const;

export type CreditPackId = keyof typeof CREDIT_PACKS;

// ---------------------------------------------------------------------------
// HD credit costs per generation type
// ---------------------------------------------------------------------------

export const CREDIT_COSTS = {
  /** Browser TTS fallback — always free */
  voice_standard: 0,
  /** HuggingFace/Replicate HD voice */
  voice_hd: 1,
  /** Text generation — free for all tiers, rate-limited */
  text_generation: 0,
  /** Standard image (Pollinations) — always free */
  image_standard: 0,
  /** HD image (Replicate FLUX) — 1 credit */
  image_hd: 1,
} as const;

export type CreditCostKey = keyof typeof CREDIT_COSTS;
