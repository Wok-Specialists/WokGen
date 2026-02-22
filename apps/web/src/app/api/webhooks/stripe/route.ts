import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import type Stripe from 'stripe';

// Raw body required for Stripe signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;

        // --- Credit pack (one-time payment) ---
        if (s.mode === 'payment' && s.metadata?.type === 'credit_pack') {
          const userId  = s.metadata.userId;
          const credits = parseInt(s.metadata.credits ?? '0', 10);
          if (userId && credits > 0) {
            await prisma.user.update({
              where: { id: userId },
              data:  { hdTopUpCredits: { increment: credits } },
            });
          }
          break;
        }

        // --- Subscription checkout ---
        if (s.mode !== 'subscription') break;

        const userId = s.metadata?.userId;
        const planId = s.metadata?.planId;
        const stripeSubId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;

        if (!userId || !planId || !stripeSubId) break;

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId) as unknown as {
          current_period_end: number;
          current_period_start: number;
        };
        const now = new Date();
        const periodEnd = new Date(stripeSub.current_period_end * 1000);

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId,
            status:              'active',
            stripeCustomerId:    typeof s.customer === 'string' ? s.customer : s.customer?.id,
            stripeSubscriptionId: stripeSubId,
            currentPeriodStart:  now,
            currentPeriodEnd:    periodEnd,
          },
          update: {
            planId,
            status:              'active',
            stripeCustomerId:    typeof s.customer === 'string' ? s.customer : s.customer?.id,
            stripeSubscriptionId: stripeSubId,
            currentPeriodStart:  now,
            currentPeriodEnd:    periodEnd,
          },
        });
        // Reset monthly HD usage counter for new subscription period
        await prisma.user.update({
          where: { id: userId },
          data:  { hdMonthlyUsed: 0 },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        };
        const existing = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!existing) break;

        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status:             sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
          },
        });
        // Reset monthly HD usage on renewal
        if (existing.userId) {
          await prisma.user.update({
            where: { id: existing.userId },
            data:  { hdMonthlyUsed: 0 },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!existing) break;

        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: 'canceled',
            planId: 'free',
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subId: string | undefined =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId) break;

        const existing = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subId },
        });
        if (!existing) break;

        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: 'past_due' },
        });
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error('[stripe/webhook] Handler error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
