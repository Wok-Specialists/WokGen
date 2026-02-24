import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen — AI Asset Generation Platform',
  description:
    'Every asset your project needs. 8 specialized AI studios for pixel art, brand systems, vectors, UI components, voice, and text.',
  keywords: [
    'AI asset generator', 'pixel art AI', 'brand asset generator',
    'sprite generator', 'AI logo maker', 'WokGen', 'WokSpec',
  ],
  openGraph: {
    title: 'WokGen — AI Asset Generation Platform',
    description: 'Generate game assets, brand kits, social banners, SVG icons, and UI components with AI.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

const MODES = [
  {
    id: 'pixel',
    label: 'WokGen Pixel',
    accent: '#a78bfa',
    status: 'live' as const,
    tagline: 'For game developers',
    desc: 'Sprites, animations, tilesets, and game-ready assets. Pixel-perfect sizes, GIF output, game engine exports.',
    highlights: ['Sprites & Characters', 'Tilesets & Scenes', 'GIF Animations', 'Game-ready export'],
    href: '/pixel',
    studioCta: '/pixel/studio',
  },
  {
    id: 'business',
    label: 'WokGen Business',
    accent: '#60a5fa',
    status: 'live' as const,
    tagline: 'For brands and teams',
    desc: 'Logos, brand kits, slide visuals, social banners, and web hero images. Platform-smart sizing built in.',
    highlights: ['Brand Logos & Kits', 'Slide Backgrounds', 'Social Banners', 'Web Hero Images'],
    href: '/business',
    studioCta: '/business/studio',
  },
  {
    id: 'vector',
    label: 'WokGen Vector',
    accent: '#34d399',
    status: 'beta' as const,
    tagline: 'For design systems',
    desc: 'SVG icon sets, illustration libraries, and design system components. Pure vector, stroke-consistent.',
    highlights: ['SVG Icon Packs', 'Illustration Sets', 'UI Kits', 'Design Tokens'],
    href: '/vector',
    studioCta: '/vector/studio',
  },
  {
    id: 'uiux',
    label: 'WokGen UI/UX',
    accent: '#f472b6',
    status: 'live' as const,
    tagline: 'For product teams',
    desc: 'React components, Tailwind sections, landing pages, and design system tokens. Prompt → production-ready code.',
    highlights: ['React Components', 'Tailwind Sections', 'Page Templates', 'Design Tokens'],
    href: '/uiux',
    studioCta: '/uiux/studio',
  },
  {
    id: 'voice',
    label: 'WokGen Voice',
    accent: '#f59e0b',
    status: 'beta' as const,
    tagline: 'Speech & Audio Generation',
    desc: 'Generate natural speech, character voices, and audio clips with AI.',
    highlights: ['Character narration', 'Product demos', 'Podcast intros', 'Game NPC dialogue'],
    href: '/voice',
    studioCta: '/voice/studio',
  },
  {
    id: 'text',
    label: 'WokGen Text',
    accent: '#10b981',
    status: 'beta' as const,
    tagline: 'AI Copywriting Engine',
    desc: 'Headlines, blogs, product copy, social posts, and creative writing at scale.',
    highlights: ['Brand headlines', 'Blog posts', 'Ad copy', 'Email campaigns'],
    href: '/text',
    studioCta: '/text/studio',
  },
] satisfies Array<{ id: string; label: string; accent: string; status: 'live' | 'beta' | 'coming_soon'; tagline: string; desc: string; highlights: readonly string[]; href: string; studioCta: string }>;

const QUICK_PROMPTS = [
  {
    mode: 'Pixel',
    label: 'Fantasy sword item icon, RPG style, transparent bg',
    href: '/pixel/studio?tool=generate&prompt=Fantasy+sword+item+icon+RPG+style+transparent+background',
    accent: '#a78bfa',
  },
  {
    mode: 'Pixel',
    label: 'Medieval castle tileset, top-down perspective',
    href: '/pixel/studio?tool=generate&prompt=Medieval+castle+tileset+top-down+perspective+seamless',
    accent: '#a78bfa',
  },
  {
    mode: 'Business',
    label: 'Minimal tech startup logo mark, dark modern',
    href: '/business/studio?tool=logo&prompt=Minimal+tech+startup+focused+on+AI+security+dark+modern',
    accent: '#60a5fa',
  },
  {
    mode: 'Business',
    label: 'Product launch social banner, SaaS minimal flat',
    href: '/business/studio?tool=social&prompt=Product+launch+announcement+SaaS+app+minimal+flat+dark',
    accent: '#60a5fa',
  },
  {
    mode: 'Vector',
    label: 'Settings gear icon, outline style, rounded corners',
    href: '/vector/studio?preset=outline&prompt=Settings+gear+icon+outline+style+rounded+corners',
    accent: '#34d399',
  },
  {
    mode: 'UI/UX',
    label: 'SaaS pricing section, 3 tiers, dark theme',
    href: '/uiux/studio?prompt=SaaS+pricing+section+3+tiers+dark+minimal',
    accent: '#f472b6',
  },
  {
    mode: 'Pixel',
    label: 'Chibi character sprite, front-facing idle pose',
    href: '/pixel/studio?tool=generate&prompt=Cute+chibi+character+sprite+front-facing+idle+pose',
    accent: '#a78bfa',
  },
] as const;

const TOOLS_PREVIEW = [
  { emoji: '🖼️', name: 'Background Remover', desc: 'Remove backgrounds instantly, no uploads.', href: '/tools/background-remover' },
  { emoji: '🎨', name: 'CSS Generator',       desc: 'Build gradients, shadows & animations visually.', href: '/tools/css-generator' },
  { emoji: '📦', name: 'JSON Toolkit',        desc: 'Format, validate and diff JSON in-browser.', href: '/tools/json-toolkit' },
  { emoji: '🗂️', name: 'Sprite Packer',       desc: 'Pack sprites into atlas sheets with JSON map.', href: '/tools/sprite-packer' },
  { emoji: '📱', name: 'QR Generator',        desc: 'Create styled QR codes with custom colors.', href: '/tools/qr-generator' },
  { emoji: '🌈', name: 'Color Palette',       desc: 'Generate harmonic palettes from any seed color.', href: '/tools/color-palette' },
] as const;


export default function PlatformLanding() {
  return (
    <div className="platform-landing">

      {/* ── Platform hero ─────────────────────────────────────────────── */}
      <section className="platform-hero">
        <div className="platform-hero-inner">
          <div className="platform-hero-eyebrow">
            <span className="platform-hero-rule" />
            <span>AI asset generation platform</span>
          </div>
          <h1 className="platform-h1">
            Create anything.<br />
            <span className="platform-h1-accent">Free forever.</span>
          </h1>
          <p className="platform-desc">
            6 AI studios · 30+ creator tools · 300+ open-source models · $0
          </p>
          <div className="platform-cta-row">
            <Link href="/pixel/studio" className="btn-primary btn-lg">
              Open Pixel Studio →
            </Link>
            <Link href="/pixel" className="btn-ghost btn-lg">
              See all studios
            </Link>
          </div>
          <p className="platform-hero-note">
            No account needed. Standard generation is always free.
          </p>
        </div>
      </section>

      {/* ── Mode cards (AI Studios) ───────────────────────────────────── */}
      <section className="platform-modes">
        <div className="platform-modes-inner">
          <p className="platform-section-label">AI Studios</p>
          <div className="platform-modes-grid">
            {MODES.map(mode => (
              <Link
                key={mode.id}
                href={mode.studioCta ?? mode.href}
                className={`platform-mode-card${(mode.status as string) === 'coming_soon' ? ' platform-mode-card--soon' : mode.status === 'beta' ? ' platform-mode-card--beta' : ''}`}
                style={{ '--mode-card-accent': mode.accent } as React.CSSProperties}
              >
                <div className="platform-mode-card-header">
                  <span className="platform-mode-accent-bar" />
                  <div>
                    <div className="platform-mode-label">{mode.label}</div>
                    <div className="platform-mode-tagline">{mode.tagline}</div>
                  </div>
                  {mode.status === 'beta' && (
                    <span className="platform-mode-badge platform-mode-badge--beta">Beta</span>
                  )}
                </div>
                <p className="platform-mode-desc">{mode.desc}</p>
                <ul className="platform-mode-highlights">
                  {mode.highlights.map(h => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                {mode.studioCta ? (
                  <span className="platform-mode-cta">Open Studio →</span>
                ) : (
                  <span className="platform-mode-cta platform-mode-cta--soon">Join Waitlist →</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Preview ─────────────────────────────────────────────── */}
      <section className="tools-preview-section">
        <div className="platform-section-inner">
          <p className="platform-section-label">Free Creator Tools</p>
          <p className="platform-desc" style={{ marginBottom: '1.5rem' }}>
            Browser-native. No uploads. No accounts needed.
          </p>
          <div className="tools-preview-grid">
            {TOOLS_PREVIEW.map(tool => (
              <Link key={tool.href} href={tool.href} className="tool-preview-card">
                <span className="tool-preview-card__icon">{tool.emoji}</span>
                <span className="tool-preview-card__name">{tool.name}</span>
                <span className="tool-preview-card__desc">{tool.desc}</span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/tools" className="btn-ghost btn-lg">View all 30+ tools →</Link>
          </div>
        </div>
      </section>

      {/* ── Quick-try prompts ─────────────────────────────────────────── */}
      <section className="platform-quicktry">
        <div className="platform-section-inner">
          <p className="platform-section-label">Try it now</p>
          <div className="platform-quicktry-grid">
            {QUICK_PROMPTS.map(q => (
              <Link
                key={q.label}
                href={q.href}
                className="platform-quicktry-card"
                style={{ '--qt-accent': q.accent } as React.CSSProperties}
              >
                <span className="platform-quicktry-mode">{q.mode}</span>
                <span className="platform-quicktry-label">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Source strip ─────────────────────────────────────────── */}
      <section className="oss-strip">
        <div className="oss-strip-inner">
          <span className="oss-strip-text">
            Powered by open source: <strong>FLUX</strong> · <strong>Stable Diffusion</strong> · <strong>Llama 3.3</strong> · <strong>Kokoro</strong> · <strong>Stable Horde</strong> · and more
          </span>
          <a
            href="https://github.com/WokSpec/WokGen"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-sm"
          >
            ★ GitHub →
          </a>
        </div>
      </section>

      {/* ── WokSpec bar ───────────────────────────────────────────────── */}
      <section className="landing-wokspec">
        <div className="landing-wokspec-inner">
          <p className="landing-wokspec-text">
            Need production-level delivery? WokSpec builds what WokGen generates.
          </p>
          <a href="https://wokspec.org" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
            WokSpec Services →
          </a>
        </div>
      </section>

    </div>
  );
}
