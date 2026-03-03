import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen — Pixel Art Studio',
  description:
    'AI-powered pixel art studio. Generate sprites, tilesets, animations, and game-ready assets — ' +
    'then refine them in the browser-based pixel editor. Free. Open source.',
  keywords: [
    'pixel art studio', 'AI pixel art generator', 'sprite generator', 'tileset generator',
    'pixel art editor', 'game asset generator', 'pixel art AI', 'WokGen', 'WokSpec',
  ],
  openGraph: {
    title: 'WokGen — Pixel Art Studio',
    description: 'Generate sprites, tilesets, and game assets with AI. Edit in-browser. Free.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

const TOOLS = [
  {
    id: 'generate',
    href: '/pixel/studio',
    label: 'AI Generator',
    desc: 'Create pixel art sprites, tilesets, characters, and effects from a text prompt. 18 style presets.',
    accent: '#a78bfa',
  },
  {
    id: 'editor',
    href: '/editor',
    label: 'Pixel Editor',
    desc: 'Browser-based canvas editor with grid, pencil, fill, eraser, and palette. No install.',
    accent: '#a78bfa',
  },
  {
    id: 'animate',
    href: '/pixel/studio?tool=animate',
    label: 'Animator',
    desc: 'Generate multi-frame sprite animations as looping GIFs. Idle, walk, run, attack presets.',
    accent: '#a78bfa',
  },
  {
    id: 'scene',
    href: '/pixel/studio?tool=scene',
    label: 'Scene Builder',
    desc: 'Generate cohesive tilesets and environmental scenes with a consistent palette.',
    accent: '#a78bfa',
  },
];

const FEATURES = [
  { icon: '🆓', label: 'Free Forever', desc: 'Unlimited standard generation, no account needed.' },
  { icon: '��', label: 'Game-Ready', desc: 'Pixel-perfect sizes: 32px, 64px, 128px, 256px, 512px.' },
  { icon: '🎞️', label: 'GIF Animation', desc: 'Multi-frame sprite animations as looping GIFs.' },
  { icon: '✏️', label: 'Browser Editor', desc: 'Edit any generated asset directly in the pixel editor.' },
  { icon: '🔮', label: 'HD Quality', desc: 'FLUX Pro for crisp high-detail pixel art on paid plans.' },
  { icon: '📦', label: 'Open Source', desc: 'MIT-licensed. Self-host your own pixel studio.' },
];

const SHOWCASE = [
  { prompt: 'RPG warrior with shield, NES style, front-facing, 64×64', label: 'RPG Warrior' },
  { prompt: 'Dungeon stone tileset, seamless, dark atmosphere', label: 'Dungeon Tiles' },
  { prompt: 'Magic fireball effect, bright orange, looping animation', label: 'Fire Effect' },
  { prompt: 'Wooden chest, golden lock, inventory icon, 32×32', label: 'Chest Item' },
  { prompt: 'Side-scroll platformer character, idle pose, pixel art', label: 'Platformer Char' },
  { prompt: 'Green slime enemy, cute pixel art, RPG, 32×32', label: 'Slime Monster' },
];

const PIXEL_PROVIDERS = ['FLUX', 'FLUX Pro', 'SDXL', 'Fal.ai', 'Replicate', 'Real-ESRGAN', 'ControlNet'];

function PixelGridIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <rect x="2"  y="2"  width="20" height="20" rx="3" opacity="0.7" />
      <rect x="26" y="2"  width="20" height="20" rx="3" />
      <rect x="2"  y="26" width="20" height="20" rx="3" />
      <rect x="26" y="26" width="20" height="20" rx="3" opacity="0.4" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="mode-landing mode-landing--pixel">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              <span>WokGen Pixel Studio</span>
            </div>
            <h1 className="landing-h1">
              Pixel art.<br />
              <span className="landing-h1-accent">Built with AI.</span>
            </h1>
            <p className="landing-desc">
              Generate sprites, tilesets, and game-ready assets with AI — then refine them
              in the browser pixel editor. Free. No account required.
            </p>
            <div className="landing-cta-row">
              <Link href="/pixel/studio" className="btn-primary btn-lg">
                Open AI Studio →
              </Link>
              <Link href="/editor" className="btn-ghost btn-lg">
                Pixel Editor
              </Link>
            </div>
          </div>
          <div className="landing-hero-visual" aria-hidden="true">
            <PixelGridIcon />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="landing-features">
        {FEATURES.map(f => (
          <div key={f.label} className="landing-feature-card">
            <span className="landing-feature-icon">{f.icon}</span>
            <div>
              <div className="landing-feature-label">{f.label}</div>
              <div className="landing-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Tools ────────────────────────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-h2">Studio Tools</h2>
          <p className="landing-section-desc">
            Four tools, one workflow — generate with AI, edit in the browser.
          </p>
          <div className="landing-tools-grid">
            {TOOLS.map(t => (
              <Link
                key={t.id}
                href={t.href}
                className="landing-tool-card"
                style={{ '--tool-accent': t.accent } as React.CSSProperties}
              >
                <div className="landing-tool-header">
                  <span className="landing-tool-label">{t.label}</span>
                </div>
                <p className="landing-tool-desc">{t.desc}</p>
                <span className="landing-tool-cta">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase ─────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section-inner">
          <h2 className="landing-h2">What you can make</h2>
          <p className="landing-section-desc">Click any prompt to try it in the AI Studio.</p>
          <div className="landing-showcase-grid">
            {SHOWCASE.map(s => (
              <Link
                key={s.label}
                href={`/pixel/studio?prompt=${encodeURIComponent(s.prompt)}`}
                className="landing-showcase-card"
              >
                <div className="landing-showcase-label">{s.label}</div>
                <div className="landing-showcase-prompt">{s.prompt}</div>
                <div className="landing-showcase-cta">Try this →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Providers ────────────────────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner landing-section-inner--center">
          <h2 className="landing-h2">Powered by</h2>
          <div className="landing-providers">
            {PIXEL_PROVIDERS.map(p => (
              <span key={p} className="landing-provider-badge">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WokSpec CTA ──────────────────────────────────────────────── */}
      <section className="landing-wokspec">
        <div className="landing-wokspec-inner">
          <p className="landing-wokspec-text">
            Need vectors, brand kits, UI components, or voice assets?
            Check out <strong>Vecto</strong> — our other creative studio.
          </p>
          <a href="https://vecto.wokspec.org" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
            Vecto Studio →
          </a>
        </div>
      </section>

    </div>
  );
}
