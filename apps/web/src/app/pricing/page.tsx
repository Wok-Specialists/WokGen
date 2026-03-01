import type { Metadata } from 'next';
import Link from 'next/link';
import ProWaitlistForm from './_waitlist-form';

export const metadata: Metadata = {
  title: 'Pricing — WokGen',
  description:
    'WokGen is free. Forever. No subscriptions, no feature gates, no paywalls. ' +
    'Powered entirely by open-source models and sustained by the community.',
};

/* ── Open-source model data ──────────────────────────────────────────────── */

const MODELS = [
  {
    name: 'FLUX.1-schnell',
    org: 'Black Forest Labs',
    license: 'Apache 2.0',
    type: 'Image generation',
  },
  {
    name: 'Stable Diffusion',
    org: 'Stability AI',
    license: 'CreativeML',
    type: 'Image generation',
  },
  {
    name: 'Deliberate',
    org: 'XpucT',
    license: 'CreativeML',
    type: 'Image generation',
  },
  {
    name: 'DreamShaper',
    org: 'Lykon',
    license: 'CreativeML',
    type: 'Image generation',
  },
  {
    name: 'SDXL 1.0',
    org: 'Stability AI',
    license: 'CreativeML',
    type: 'Image generation',
  },
  {
    name: 'Llama 3.3 70B',
    org: 'Meta',
    license: 'Llama License',
    type: 'Language model',
  },
  {
    name: 'Kokoro-82M',
    org: 'hexgrad',
    license: 'Apache 2.0',
    type: 'Text-to-speech',
  },
  {
    name: 'Stable Horde',
    org: 'crowdsourced GPUs',
    license: 'AGPL',
    type: 'Distributed inference',
  },
] as const;

/* ── Tier data ───────────────────────────────────────────────────────────── */

const FREE_FEATURES = [
  '100 generations / day',
  'Standard quality',
  'Up to 10 projects',
  'All creative tools',
  'Eral (10 msgs/hr)',
  'Public gallery',
  'Community support',
  'API access (WokAPI)',
];

const PRO_FEATURES = [
  'Unlimited generations',
  'HD quality (unlimited)',
  'Unlimited projects',
  'All tools + early access',
  'Eral (unlimited)',
  'Private workspace',
  'Priority support',
  'Higher API rate limits',
];

const ENTERPRISE_FEATURES = [
  'Everything in Pro',
  'Dedicated infrastructure',
  'SSO + audit logs',
  'Custom model fine-tuning',
  'Priority Eral',
  'White-label option',
  'SLA guarantees',
  'Dedicated account manager',
];

/* ── FAQ ─────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: 'Is WokGen really free?',
    a: 'Yes. WokGen is free forever. All core features are available without a subscription or credit card. The free tier includes 100 generations per day, all creative tools, and community access.',
  },
  {
    q: 'What are the daily generation limits?',
    a: 'Free users get 100 standard generations per day — plenty for regular creative work. Guest users (no account) get 10. Limits reset at midnight UTC. Self-hosting removes all limits.',
  },
  {
    q: 'What providers are used for generation?',
    a: 'WokGen uses Pollinations.ai and Prodia for standard generation (free, no key needed), and optionally FAL, Replicate, and Stability AI for HD quality. You can connect your own API keys in Settings.',
  },
  {
    q: 'Can I self-host WokGen?',
    a: 'Absolutely. The entire stack is MIT-licensed and documented. Use ComfyUI for local image generation and Ollama for language models. No quotas, no rate limits, full control over your data.',
  },
] as const;

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <main className="manifesto-page">

      {/* Hero */}
      <section className="pricing-header">
        <p className="pricing-eyebrow">Open Source · Free Forever</p>
        <h1 className="pricing-h1">
          WokGen is free.{' '}
          <span className="pricing-h1-accent">Forever.</span>
        </h1>
        <p className="pricing-sub">
          No subscriptions. No feature gates. No paywalls.
        </p>
      </section>

      {/* Tier comparison */}
      <section className="pricing-tiers-section">

        {/* 10 free integrations callout */}
        <div className="pricing-integrations-callout">
          <span className="pricing-callout-icon" aria-hidden="true">🔌</span>
          <div>
            <strong className="pricing-callout-strong">All plans include 10 free AI service integrations.</strong>
            <span className="pricing-callout-desc">
              Connect FAL, Replicate, Stability AI, and more — free tier keys included, no account required.
            </span>
          </div>
        </div>

        <div className="pricing-tier-grid">

          {/* FREE */}
          <div className="pricing-tier pricing-tier--free">
            <div>
              <div className="pricing-tier__header">
                <span className="pricing-tier__name">FREE</span>
                <span className="pricing-tier__badge pricing-tier__badge--accent">Forever</span>
              </div>
              <div className="pricing-tier__price">$0<span className="pricing-tier__period"> / mo</span></div>
              <p className="pricing-tier__desc">The full WokGen experience. Always free, no credit card required.</p>
            </div>
            <Link href="/studio" className="btn-primary pricing-tier__cta">
              Start creating →
            </Link>
            <ul className="pricing-tier__features">
              {FREE_FEATURES.map(f => (
                <li key={f} className="pricing-feature pricing-feature--accent">
                  <span className="pricing-feature__check" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* PRO */}
          <div className="pricing-tier pricing-tier--pro">
            <div className="pricing-tier__coming-soon">Coming Soon</div>
            <div>
              <div className="pricing-tier__header">
                <span className="pricing-tier__name pricing-tier__name--blue">PRO</span>
              </div>
              <div className="pricing-tier__price pricing-tier__price--muted">TBD<span className="pricing-tier__period"> / mo</span></div>
              <p className="pricing-tier__desc">Power-user features with unlimited generation and private workspace.</p>
            </div>
            <ProWaitlistForm />
            <ul className="pricing-tier__features">
              {PRO_FEATURES.map(f => (
                <li key={f} className="pricing-feature pricing-feature--blue">
                  <span className="pricing-feature__check" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* ENTERPRISE */}
          <div className="pricing-tier pricing-tier--enterprise">
            <div>
              <div className="pricing-tier__header">
                <span className="pricing-tier__name pricing-tier__name--green">ENTERPRISE</span>
              </div>
              <div className="pricing-tier__price">Custom</div>
              <p className="pricing-tier__desc">Dedicated infrastructure, SSO, audit logs, and white-label options for teams.</p>
            </div>
            <a
              href="https://wokspec.org/consult"
              target="_blank"
              rel="noopener noreferrer"
              className="pricing-tier__cta pricing-tier__cta--green"
            >
              Contact us →
            </a>
            <ul className="pricing-tier__features">
              {ENTERPRISE_FEATURES.map(f => (
                <li key={f} className="pricing-feature pricing-feature--green">
                  <span className="pricing-feature__check" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="pricing-faq-section">
        <h2 className="pricing-faq-h2">FAQ</h2>
        {FAQ_ITEMS.map(({ q, a }) => (
          <details key={q} className="pricing-faq-item">
            <summary className="pricing-faq-summary">{q}</summary>
            <p className="pricing-faq-answer">{a}</p>
          </details>
        ))}
      </section>

      {/* Models */}
      <section className="manifesto-models-section">
        <div className="manifesto-models-inner">
          <p className="manifesto-models-label">Powered entirely by open-source models</p>
          <div className="manifesto-models-grid">
            {MODELS.map((m) => (
              <div key={m.name} className="manifesto-model-card">
                <div className="manifesto-model-name">{m.name}</div>
                <div className="manifesto-model-org">{m.org} · {m.type}</div>
                <span className="manifesto-model-license">{m.license}</span>
              </div>
            ))}
          </div>
          <div className="manifesto-models-cta">
            <Link href="/open-source" className="btn-ghost">
              View full model registry →
            </Link>
          </div>
        </div>
      </section>

      {/* Community section */}
      <section className="manifesto-section">
        <div className="manifesto-section-inner">
          <p className="pricing-eyebrow">Sustained by the community</p>
          <h2 className="manifesto-section-h2">
            No investors. No ads. Just you.
          </h2>
          <p className="manifesto-section-desc">
            WokGen is open-source and community-funded. Server costs and model hosting are covered
            entirely through voluntary crypto donations from people who find WokGen useful.
            The core product is and always will be free.
          </p>
          <div className="manifesto-actions">
            <Link href="/support" className="btn-primary btn-lg">
              Support with crypto →
            </Link>
          </div>
        </div>
      </section>

      {/* Self-host section */}
      <section className="manifesto-section">
        <div className="manifesto-section-inner">
          <p className="pricing-eyebrow">Self-host everything</p>
          <h2 className="manifesto-section-h2">
            Your infra. Your rules.
          </h2>
          <p className="manifesto-section-desc">
            Run WokGen on your own hardware with{' '}
            <strong>ComfyUI</strong> for image generation and{' '}
            <strong>Ollama</strong> for local language models. Zero quota,
            zero rate limits, and complete control over your data.
            The entire stack is MIT-licensed and fully documented.
          </p>
          <div className="manifesto-actions">
            <Link href="/docs" className="btn-ghost btn-lg">
              Read the self-hosting guide →
            </Link>
            <a
              href="https://github.com/WokSpec/WokGen"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-lg"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="manifesto-section">
        <div className="manifesto-section-inner">
          <h2 className="manifesto-section-h2">Ready to create?</h2>
          <p className="manifesto-section-desc">
            Open the studio, pick a model, and start generating — no account required.
          </p>
          <div className="manifesto-actions">
            <Link href="/studio" className="btn-primary btn-lg">
              Open Studio →
            </Link>
            <Link href="/support" className="btn-ghost btn-lg">
              Support the project
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
