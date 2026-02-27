import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen — AI Generation Studio',
  description: 'Studio for pixel art, brand assets, vectors, UI components, voice, and code. One workspace, every asset type.',
  keywords: ['AI asset generator', 'pixel art AI', 'brand asset generator', 'sprite generator', 'AI logo maker', 'WokGen', 'WokSpec'],
  openGraph: {
    title: 'WokGen — AI Generation Studio',
    description: 'Studio for pixel art, brand assets, vectors, UI components, voice, and code.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

const MODES = [
  {
    id: 'pixel',
    label: 'Pixel Art',
    accent: 'var(--accent)',
    desc: 'Sprites, tilesets, and game-ready asset packs.',
  },
  {
    id: 'business',
    label: 'Brand',
    accent: 'var(--blue)',
    desc: 'Logos, brand kits, and social visuals.',
  },
  {
    id: 'vector',
    label: 'Vector',
    accent: 'var(--green)',
    desc: 'SVG icon sets, illustrations, and graphics.',
  },
  {
    id: 'uiux',
    label: 'UI / UX',
    accent: 'var(--pink)',
    desc: 'React components, Tailwind sections, and templates.',
  },
  {
    id: 'voice',
    label: 'Voice',
    accent: 'var(--yellow)',
    desc: 'TTS narration and audio assets.',
  },
  {
    id: 'code',
    label: 'Text / Code',
    accent: 'var(--orange)',
    desc: 'Components, docs, SQL, and boilerplate.',
  },
];

export default function HomePage() {
  return (
    <div className="homepage-root">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="homepage-hero">
        <div className="bg-grid" />
        <div className="homepage-hero-orbs">
          <div className="orb orb-purple homepage-orb-1" />
          <div className="orb orb-violet homepage-orb-2" />
          <div className="orb orb-grey homepage-orb-3" />
        </div>
        <div className="homepage-hero-inner">
          <h1 className="homepage-h1">
            WokGen Studio
          </h1>
          <p className="homepage-hero-sub">
            AI generation for pixel art, brand assets, vectors, UI, voice, and code.
          </p>
          <div className="homepage-hero-ctas">
            <Link href="/studio?type=pixel" className="homepage-cta-primary">
              Open Studio
            </Link>
            <Link href="/tools" className="homepage-cta-ghost">
              Browse Tools
            </Link>
          </div>
        </div>
      </section>

      {/* ── Studio Modes ──────────────────────────────────────────── */}
      <section className="homepage-modes">
        <div className="homepage-section-inner">
          <div className="homepage-modes-grid">
            {MODES.map(mode => (
              <Link
                key={mode.id}
                href={`/studio?type=${mode.id}`}
                className="homepage-mode-card"
                style={{ '--mode-accent': mode.accent } as React.CSSProperties}
              >
                <div className="homepage-mode-top-border" />
                <div className="homepage-mode-header">
                  <span className="homepage-mode-dot" />
                  <span className="homepage-mode-name">{mode.label}</span>
                </div>
                <div className="homepage-mode-tagline">{mode.desc}</div>
                <span className="homepage-mode-cta">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eral ──────────────────────────────────────────────────── */}
      <section className="homepage-eral">
        <div className="homepage-section-inner">
          <div className="homepage-eral-grid">
            <div className="homepage-eral-left">
              <h2 className="homepage-section-title">Eral</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '420px' }}>
                Describe what you&apos;re building. Eral plans your asset pipeline, routes tasks to the right studio, and maintains context across your project.
              </p>
              <Link href="/eral" className="homepage-cta-primary">Open Eral</Link>
            </div>
            <div className="homepage-eral-right">
              <div className="homepage-chat-preview">
                <div className="homepage-chat-header">
                  <span className="homepage-chat-dot" />
                  <span>Eral</span>
                </div>
                <div className="homepage-chat-messages">
                  <div className="homepage-chat-msg homepage-chat-user">
                    I need assets for a dark fantasy RPG main menu.
                  </div>
                  <div className="homepage-chat-msg homepage-chat-eral">
                    Here&apos;s what I&apos;d queue:<br /><br />
                    <strong>1.</strong> Hero background — Pixel mode<br />
                    <strong>2.</strong> Logo with runic type — Brand mode<br />
                    <strong>3.</strong> UI button set — UI/UX mode<br /><br />
                    Queue all three?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── API ───────────────────────────────────────────────────── */}
      <section className="homepage-wokapi">
        <div className="homepage-section-inner">
          <div className="homepage-wokapi-grid">
            <div className="homepage-wokapi-left">
              <h2 className="homepage-section-title">API</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '420px' }}>
                Programmatic access to every studio mode. Integrate generation into your own tools, pipelines, and workflows.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a className="homepage-cta-primary" href="/developers">Docs</a>
                <a className="homepage-cta-ghost" href="/account/api-keys">API keys</a>
              </div>
            </div>
            <div className="homepage-wokapi-right">
              <div className="homepage-code-block">
                <div className="homepage-code-header">
                  <span className="homepage-code-dot" />
                  <span className="homepage-code-dot" />
                  <span className="homepage-code-dot" />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>@wokspec/sdk</span>
                </div>
                <pre className="homepage-code-body"><code>{`import WokGen from '@wokspec/sdk';

const wok = new WokGen({ apiKey: 'wok_...' });

const asset = await wok.generate({
  prompt: 'pixel art wizard, 32x32',
  mode: 'pixel',
});

console.log(asset.url);`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer strip ──────────────────────────────────────────── */}
      <section className="homepage-oss">
        <div className="homepage-oss-inner">
          <div className="homepage-oss-row">
            <div className="homepage-oss-links">
              <a href="https://github.com/WokSpec/WokGen" target="_blank" rel="noopener noreferrer" className="homepage-oss-link">
                GitHub
              </a>
              <a href="/changelog" className="homepage-oss-link">Changelog</a>
              <a href="/docs" className="homepage-oss-link">Docs</a>
            </div>
            <div className="homepage-oss-providers">
              <span className="homepage-provider-badge">FLUX</span>
              <span className="homepage-provider-badge">Stable Diffusion</span>
              <span className="homepage-provider-badge">Llama 3.3</span>
              <span className="homepage-provider-badge">Kokoro</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
