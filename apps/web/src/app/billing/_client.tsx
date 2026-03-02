'use client';

import Link from 'next/link';

interface Plan { id: string; name: string; priceUsdCents: number; creditsPerMonth: number; }
interface Props {
  currentPlanId: string;
  stripeEnabled: boolean;
  plans: Plan[];
  hdCredits: { monthly: number; topUp: number };
  creditPacks: unknown[];
}

export default function BillingClient(_props: Props) {
  return (
    <main className="bill-main">
      <div className="bill-card">
        <div className="bill-emoji">🎉</div>
        <h1 className="bill-title">WokGen is free to use</h1>
        <p className="bill-desc">
          No subscriptions, no paywalls, no credit card required.
          WokGen gives you full access to all studios, tools, and Eral — forever free.
        </p>
        <div className="bill-enterprise-box">
          <p className="bill-enterprise-text">
            Need dedicated infrastructure, SSO, white-label, or custom model fine-tuning for your team?
          </p>
          <a
            href="https://wokspec.org/consult"
            target="_blank"
            rel="noopener noreferrer"
            className="bill-enterprise-link"
          >
            Talk to us about Enterprise →
          </a>
        </div>
        <Link href="/dashboard" className="bill-back">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}
