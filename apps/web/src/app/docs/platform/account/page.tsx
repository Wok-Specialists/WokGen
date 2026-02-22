import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account & Credits · Docs',
  description: 'Managing your WokGen account, credits, subscriptions, and usage.',
};

export default function DocsAccount() {
  return (
    <div className="docs-page">
      <div className="docs-page-inner">

        {/* Sidebar */}
        <aside className="docs-sidebar">
          <Link href="/docs" className="docs-back">← Docs Hub</Link>
          <div className="docs-sidebar-mode">
            <span>⚙</span> Platform
          </div>
          <nav className="docs-toc">
            <a href="#account" className="docs-toc-link">Your Account</a>
            <a href="#plans" className="docs-toc-link">Plans & Credits</a>
            <a href="#hd-credits" className="docs-toc-link">HD Credits</a>
            <a href="#billing" className="docs-toc-link">Billing</a>
            <a href="#security" className="docs-toc-link">Security</a>
          </nav>
          <div className="docs-sidebar-links">
            <Link href="/docs/platform/billing" className="docs-toc-link">Billing Docs →</Link>
          </div>
        </aside>

        {/* Content */}
        <main className="docs-content">
          <div className="docs-content-header">
            <h1 className="docs-title">Account & Credits</h1>
            <p className="docs-subtitle">Everything you need to know about your WokGen account, subscription plans, and HD credit system.</p>
          </div>

          <section id="account">
            <h2 className="docs-h2">Your Account</h2>
            <p className="docs-p">Sign in to WokGen with your GitHub account to unlock authenticated access. Without signing in, you can still generate as a guest — but with a reduced rate limit (5 generations/minute) and no history persistence.</p>
            <p className="docs-p">Once signed in, your account dashboard shows your credit balance, generation history, recent assets, and subscription status.</p>
            <div className="docs-callout docs-callout--info">
              <span className="docs-callout-icon">ℹ</span>
              <span>WokGen uses GitHub OAuth only. No email/password accounts. This keeps sign-in simple and secure.</span>
            </div>
          </section>

          <section id="plans">
            <h2 className="docs-h2">Plans & Credits</h2>
            <p className="docs-p">WokGen has a simple free tier and affordable paid plans. Standard quality generation (Pollinations) is always free for everyone — no account required. HD quality generation uses credits.</p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Price</th>
                    <th>HD Credits/mo</th>
                    <th>Generation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Free</td><td>$0</td><td>0</td><td>Unlimited standard</td></tr>
                  <tr><td>Plus</td><td>$2/mo</td><td>20</td><td>Unlimited standard + HD</td></tr>
                  <tr><td>Pro</td><td>$6/mo</td><td>60</td><td>Unlimited standard + HD</td></tr>
                  <tr><td>Max</td><td>$15/mo</td><td>200</td><td>Unlimited standard + HD</td></tr>
                </tbody>
              </table>
            </div>
            <p className="docs-p">Standard quality uses the Pollinations provider (free, no credit cost). HD quality uses high-quality models via Replicate and costs 1 credit per generation.</p>
          </section>

          <section id="hd-credits">
            <h2 className="docs-h2">HD Credits</h2>
            <p className="docs-p">HD credits are used when you enable the HD toggle in any Studio. Monthly credits reset on your billing anniversary. You can also purchase top-up credit packs at any time.</p>
            <h3 className="docs-h3">Credit Packs</h3>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Pack</th><th>Price</th><th>Credits</th></tr>
                </thead>
                <tbody>
                  <tr><td>Micro</td><td>$1</td><td>30</td></tr>
                  <tr><td>Small</td><td>$3</td><td>100</td></tr>
                  <tr><td>Medium</td><td>$8</td><td>400</td></tr>
                  <tr><td>Large</td><td>$20</td><td>1,200</td></tr>
                </tbody>
              </table>
            </div>
            <div className="docs-callout docs-callout--tip">
              <span className="docs-callout-icon">✦</span>
              <span>Monthly plan credits are used first. Top-up credits only deduct when monthly allocation is exhausted.</span>
            </div>
            <p className="docs-p">For the Brand Kit tool in Business Studio, each of the 4 generated images costs 1 HD credit when HD mode is enabled (4 credits total per brand kit).</p>
          </section>

          <section id="billing">
            <h2 className="docs-h2">Billing</h2>
            <p className="docs-p">All billing is handled securely through Stripe. Your payment information is never stored on WokGen servers. Subscriptions auto-renew monthly and can be cancelled at any time from the Billing page.</p>
            <p className="docs-p">To manage your subscription, visit the <Link href="/billing" className="docs-code">Billing page</Link> and click &ldquo;Manage Subscription&rdquo; to open the Stripe customer portal.</p>
          </section>

          <section id="security">
            <h2 className="docs-h2">Security</h2>
            <p className="docs-p">WokGen uses NextAuth.js with GitHub OAuth. Sessions are secured with HTTP-only cookies. All API endpoints validate authentication server-side. Your API keys (if used in self-hosted mode) are never stored on WokSpec servers.</p>
          </section>

          <div className="docs-content-footer">
            <Link href="/billing" className="btn-primary btn-sm">View Plans →</Link>
            <Link href="/docs/platform/billing" className="btn-ghost btn-sm">Billing Docs →</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
