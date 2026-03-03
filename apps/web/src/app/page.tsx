import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen — Free AI Pixel Art Studio',
  description:
    'Generate sprites, tilesets, animations & game-ready assets with AI. Browser-based pixel editor, palette studio, atlas packer — all free, no account required.',
  keywords: [
    'free pixel art generator', 'AI pixel art studio', 'sprite generator', 'tileset generator',
    'pixel art editor', 'game asset generator', 'pixel art AI', 'WokGen', 'free sprite maker',
    'pixel animation generator', 'RPG asset generator',
  ],
  openGraph: {
    title: 'WokGen — Free AI Pixel Art Studio',
    description: 'Generate sprites, tilesets, and game assets with AI. Edit in-browser. Free, no signup.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

const TOOLS = [
  {
    id: 'studio',
    href: '/pixel/studio',
    emoji: '🎨',
    label: 'AI Generator',
    desc: 'Generate sprites, tilesets, characters, and effects from a text prompt. 18+ style presets.',
    tag: 'Free',
    tagColor: '#22c55e',
  },
  {
    id: 'editor',
    href: '/editor',
    emoji: '✏️',
    label: 'Pixel Editor',
    desc: 'Browser canvas editor — pencil, fill, eraser, palette, undo. No install needed.',
    tag: 'Free',
    tagColor: '#22c55e',
  },
  {
    id: 'animate',
    href: '/pixel/animate',
    emoji: '🎬',
    label: 'Animator',
    desc: 'Generate multi-frame sprite animations and looping GIFs. 8 animation presets.',
    tag: 'Free',
    tagColor: '#22c55e',
  },
  {
    id: 'palette',
    href: '/pixel/palette',
    emoji: '🎭',
    label: 'Palette Studio',
    desc: 'Generate and refine pixel-perfect color palettes. Export as PNG or ASE.',
    tag: 'Free',
    tagColor: '#22c55e',
  },
  {
    id: 'atlas',
    href: '/pixel/atlas',
    emoji: '📦',
    label: 'Atlas Packer',
    desc: 'Pack multiple sprites into optimized texture atlases. Export with JSON metadata.',
    tag: 'Free',
    tagColor: '#22c55e',
  },
  {
    id: 'prompt-lab',
    href: '/prompt-lab',
    emoji: '🧪',
    label: 'Prompt Lab',
    desc: 'Experiment with style presets, apply quick chips, and craft the perfect generation prompt.',
    tag: 'Free',
    tagColor: '#22c55e',
  },
];

const FEATURES = [
  { icon: '🆓', label: 'Truly Free',       desc: 'No account, no credit card. Standard generation is unlimited and free via Pollinations.' },
  { icon: '🕹️', label: 'Game-Ready',       desc: 'Pixel-perfect sizes: 32px, 64px, 128px, 256px, 512px — export at 1×, 2×, 4×, 8×.' },
  { icon: '🎞️', label: 'GIF Animation',    desc: 'Multi-frame sprite animations output as looping GIFs ready for engines.' },
  { icon: '✏️', label: 'Browser Editor',   desc: 'Edit any AI-generated asset directly in the pixel editor — no download required.' },
  { icon: '🔮', label: 'HD Quality',        desc: 'FLUX Pro for crisp high-detail pixel art when you bring your own API key.' },
  { icon: '📦', label: 'Open Source',       desc: 'MIT-licensed. Self-host your own pixel studio, fork it, or contribute.' },
];

const STEPS = [
  { n: '01', title: 'Describe your asset', body: 'Type a prompt like "RPG warrior sprite, NES style, 64×64" — or pick a style preset.' },
  { n: '02', title: 'Generate with AI',    body: 'Hit Generate. We route to the best free provider automatically — Pollinations, Together AI, or SDXL.' },
  { n: '03', title: 'Refine & export',     body: 'Tweak in the pixel editor, upscale to 8×, download as PNG or GIF — game-ready in seconds.' },
];

const SHOWCASE = [
  { prompt: 'RPG warrior with iron shield, NES style, front-facing, 64×64', label: 'RPG Warrior' },
  { prompt: 'Dungeon stone brick tileset, seamless, dark atmosphere', label: 'Dungeon Tiles' },
  { prompt: 'Magic fireball effect, bright orange, game animation frame', label: 'Fire Effect' },
  { prompt: 'Wooden chest, golden lock, inventory icon, 32×32', label: 'Chest Item' },
  { prompt: 'Side-scroll platformer hero, idle pose, retro 16-bit style', label: 'Platformer Hero' },
  { prompt: 'Green slime enemy, cute pixel art, RPG, 32×32', label: 'Slime Monster' },
  { prompt: 'Sci-fi laser gun, neon blue, isometric view, inventory icon', label: 'Sci-Fi Gun' },
  { prompt: 'Forest tileset, pine trees and grass, top-down RPG', label: 'Forest Tiles' },
  { prompt: 'Wizard NPC, purple robe, staff, front-facing character', label: 'Wizard NPC' },
];

const PIXEL_PROVIDERS = [
  { name: 'Pollinations', free: true },
  { name: 'FLUX', free: false },
  { name: 'FLUX Pro', free: false },
  { name: 'Together AI', free: false },
  { name: 'Fal.ai', free: false },
  { name: 'Replicate', free: false },
  { name: 'Real-ESRGAN', free: true },
  { name: 'ControlNet', free: false },
];

export default function HomePage() {
  return (
    <div className="mode-landing mode-landing--pixel">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="landing-hero landing-hero--rich">
        <div className="landing-pixel-grid" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              <span>Free · No Signup · Open Source</span>
            </div>
            <h1 className="landing-h1">
              AI Pixel Art.<br />
              <span className="landing-h1-accent">Free forever.</span>
            </h1>
            <p className="landing-desc">
              Generate sprites, tilesets, characters & animations with AI.
              Edit in the browser. Export at any scale.
              No account. No credit card. No limits.
            </p>
            <div className="landing-cta-row">
              <Link href="/pixel/studio" className="btn-primary btn-lg landing-cta-primary">
                🎨 Start Generating — Free
              </Link>
              <Link href="/editor" className="btn-ghost btn-lg">
                ✏️ Open Editor
              </Link>
            </div>
            <div className="landing-hero-stats">
              <span className="landing-stat">18+ style presets</span>
              <span className="landing-stat-sep">·</span>
              <span className="landing-stat">6 AI tools</span>
              <span className="landing-stat-sep">·</span>
              <span className="landing-stat">Export 1×–8×</span>
              <span className="landing-stat-sep">·</span>
              <span className="landing-stat">MIT license</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section-inner">
          <h2 className="landing-h2">How it works</h2>
          <p className="landing-section-desc">From prompt to game-ready asset in under 10 seconds.</p>
          <div className="landing-steps">
            {STEPS.map(s => (
              <div key={s.n} className="landing-step">
                <div className="landing-step-num">{s.n}</div>
                <div>
                  <div className="landing-step-title">{s.title}</div>
                  <div className="landing-step-body">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
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

      {/* ── Tools ────────────────────────────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-h2">Studio Tools</h2>
          <p className="landing-section-desc">
            Six free tools, one creative workflow.
          </p>
          <div className="landing-tools-grid landing-tools-grid--6">
            {TOOLS.map(t => (
              <Link
                key={t.id}
                href={t.href}
                className="landing-tool-card"
                style={{ '--tool-accent': '#7c3aed' } as React.CSSProperties}
              >
                <div className="landing-tool-header">
                  <span className="landing-tool-emoji">{t.emoji}</span>
                  <span className="landing-tool-label">{t.label}</span>
                  <span className="landing-tool-tag" style={{ background: t.tagColor + '22', color: t.tagColor, border: `1px solid ${t.tagColor}55` }}>{t.tag}</span>
                </div>
                <p className="landing-tool-desc">{t.desc}</p>
                <span className="landing-tool-cta">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase ─────────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section-inner">
          <h2 className="landing-h2">What you can make</h2>
          <p className="landing-section-desc">Click any prompt to try it in the AI Studio.</p>
          <div className="landing-showcase-grid landing-showcase-grid--3">
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

      {/* ── Free tier callout ─────────────────────────────────────────────── */}
      <section className="landing-free-callout">
        <div className="landing-free-callout-inner">
          <div className="landing-free-icon">🆓</div>
          <div>
            <div className="landing-free-title">Always free, no strings attached</div>
            <div className="landing-free-body">
              Standard generation uses <strong>Pollinations</strong> — a free, open-access AI image API. No account, no credits, no rate limits for standard quality.
              Bring your own API key (Replicate, fal.ai, Together AI) to unlock HD FLUX Pro generation.
            </div>
          </div>
          <Link href="/pixel/studio" className="landing-free-cta">
            Start Free →
          </Link>
        </div>
      </section>

      {/* ── Providers ────────────────────────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner landing-section-inner--center">
          <h2 className="landing-h2">Powered by</h2>
          <div className="landing-providers">
            {PIXEL_PROVIDERS.map(p => (
              <span key={p.name} className={`landing-provider-badge ${p.free ? 'landing-provider-badge--free' : ''}`}>
                {p.name}
                {p.free && <span className="landing-provider-free-tag">free</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community CTA ─────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section-inner landing-section-inner--center">
          <h2 className="landing-h2">Join the community</h2>
          <p className="landing-section-desc">Browse AI-generated pixel art, get inspired, share your creations.</p>
          <div className="landing-cta-row" style={{ justifyContent: 'center' }}>
            <Link href="/explore" className="btn-primary btn-lg">🌐 Explore Community</Link>
            <Link href="/gallery" className="btn-ghost btn-lg">🖼️ Your Gallery</Link>
          </div>
        </div>
      </section>

      {/* ── WokSpec CTA ───────────────────────────────────────────────────── */}
      <section className="landing-wokspec">
        <div className="landing-wokspec-inner">
          <p className="landing-wokspec-text">
            Need vectors, brand kits, UI components, or voice assets?
            Check out <strong>Vecto</strong> — our sister creative studio.
          </p>
          <a href="https://vecto.wokspec.org" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
            Vecto Studio →
          </a>
        </div>
      </section>

    </div>
  );
}
