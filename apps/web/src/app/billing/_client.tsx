'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  priceUsdCents: number;
  creditsPerMonth: number;
}

interface Props {
  currentPlanId: string;
  stripeEnabled: boolean;
  plans: Plan[];
}

export default function BillingClient({ currentPlanId, stripeEnabled, plans }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('portal');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Failed to open billing portal.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="billing-page">
      <div className="billing-header">
        <h1>Plans</h1>
        <p>Choose the plan that fits your workflow.</p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPaid = plan.priceUsdCents > 0;

          return (
            <div key={plan.id} className={`plan-card ${isCurrent ? 'plan-card--current' : ''}`}>
              {isCurrent && <span className="plan-badge">Current</span>}
              <h2 className="plan-name">{plan.name}</h2>
              <div className="plan-price">
                {plan.priceUsdCents === 0
                  ? <span className="plan-price-free">Free</span>
                  : <>
                      <span className="plan-price-amount">${plan.priceUsdCents / 100}</span>
                      <span className="plan-price-period">/month</span>
                    </>
                }
              </div>
              <ul className="plan-features">
                <li>{plan.creditsPerMonth} generations / month</li>
                <li>Together AI (FLUX.1)</li>
                {plan.id !== 'free' && <li>Priority queue</li>}
                {plan.id === 'studio' && <li>Batch export</li>}
              </ul>

              {!isCurrent && (
                <button
                  className="plan-cta"
                  onClick={isPaid ? () => handleUpgrade(plan.id) : undefined}
                  disabled={!stripeEnabled || loading === plan.id}
                >
                  {loading === plan.id ? 'Redirecting…' : isPaid ? 'Upgrade' : 'Downgrade'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {stripeEnabled && currentPlanId !== 'free' && (
        <div className="billing-manage">
          <button
            className="manage-btn"
            onClick={handleManage}
            disabled={loading === 'portal'}
          >
            {loading === 'portal' ? 'Opening…' : 'Manage billing →'}
          </button>
        </div>
      )}

      {!stripeEnabled && (
        <p className="billing-note">
          Billing is not yet configured. Contact support to upgrade.
        </p>
      )}

      <style jsx>{`
        .billing-page { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; }
        .billing-header { margin-bottom: 2.5rem; }
        .billing-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .billing-header p { color: var(--text-secondary, #888); margin: 0; }
        .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
        .plan-card {
          background: var(--surface-card, #161616);
          border: 1px solid var(--border-subtle, #262626);
          border-radius: 8px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }
        .plan-card--current { border-color: #10b981; }
        .plan-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #10b981;
          background: rgba(16,185,129,.12);
          border: 1px solid rgba(16,185,129,.25);
          border-radius: 4px;
          padding: 2px 6px;
        }
        .plan-name { font-size: 1.1rem; font-weight: 600; margin: 0; }
        .plan-price { display: flex; align-items: baseline; gap: 0.2rem; }
        .plan-price-free { font-size: 1.4rem; font-weight: 700; }
        .plan-price-amount { font-size: 2rem; font-weight: 700; }
        .plan-price-period { color: var(--text-muted, #666); font-size: 0.85rem; }
        .plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
        .plan-features li { font-size: 0.875rem; color: var(--text-secondary, #888); padding-left: 1rem; position: relative; }
        .plan-features li::before { content: '✓'; position: absolute; left: 0; color: #10b981; }
        .plan-cta {
          margin-top: auto;
          width: 100%;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          background: #10b981;
          color: #000;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }
        .plan-cta:disabled { opacity: 0.6; cursor: not-allowed; }
        .billing-manage { margin-top: 2rem; }
        .manage-btn {
          background: none;
          border: 1px solid var(--border-subtle, #262626);
          border-radius: 6px;
          color: var(--text-secondary, #888);
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .manage-btn:hover { border-color: #444; color: var(--text-primary, #f0f0f0); }
        .billing-note { color: var(--text-muted, #666); font-size: 0.85rem; margin-top: 2rem; }
      `}</style>
    </main>
  );
}
