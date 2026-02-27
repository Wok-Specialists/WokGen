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
    <main style={{ maxWidth: '640px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '2.5rem',
        background: 'var(--surface-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>WokGen is free to use</h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          No subscriptions, no paywalls, no credit card required.
          WokGen gives you full access to all studios, tools, and Eral — forever free.
        </p>
        <div style={{ padding: '1rem 1.25rem', borderRadius: '8px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-glow)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Need dedicated infrastructure, SSO, white-label, or custom model fine-tuning for your team?
          </p>
          <a
            href="https://wokspec.org/consult"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              marginTop: '0.875rem',
              padding: '0.5625rem 1.25rem',
              background: 'var(--accent)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#fff',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            Talk to us about Enterprise →
          </a>
        </div>
        <Link href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', textDecoration: 'none' }}>
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}
