import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen — Multi-Vertical AI Asset Generation Platform',
  description:
    'WokGen is a multi-vertical generative asset platform. Pixel art for game devs, brand assets for businesses, vectors for designers, and more.',
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
    icon: '👾',
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
    icon: '💼',
    highlights: ['Brand Logos & Kits', 'Slide Backgrounds', 'Social Banners', 'Web Hero Images'],
    href: '/business',
    studioCta: '/business/studio',
  },
  {
    id: 'vector',
    label: 'WokGen Vector',
    accent: '#34d399',
    status: 'coming_soon' as const,
    tagline: 'For design systems',
    desc: 'SVG icon sets, illustration libraries, and design system components. Pure vector, stroke-consistent.',
    icon: '✦',
    highlights: ['SVG Icon Packs', 'Illustration Sets', 'UI Kits', 'Design Tokens'],
    href: '/vector',
    studioCta: null,
  },
  {
    id: 'emoji',
    label: 'WokGen Emoji',
    accent: '#fb923c',
    status: 'coming_soon' as const,
    tagline: 'For platforms and apps',
    desc: 'Custom emoji packs, reaction sets, Discord/Slack icons, and app icon sets. Platform-correct sizing.',
    icon: '😄',
    highlights: ['Emoji Packs', 'Reaction Sets', 'Sticker Packs', 'App Icons'],
    href: '/emoji',
    studioCta: null,
  },
  {
    id: 'uiux',
    label: 'WokGen UI/UX',
    accent: '#f472b6',
    status: 'coming_soon' as const,
    tagline: 'For product teams',
    desc: 'React components, Tailwind sections, landing pages, and design system tokens. Prompt → production-ready code.',
    icon: '⌨',
    highlights: ['React Components', 'Tailwind Sections', 'Page Templates', 'Design Tokens'],
    href: '/uiux',
    studioCta: null,
  },
] as const;

export default function PlatformLanding() {
  return (
    <div className="platform-landing">

      {/* ── Platform hero ─────────────────────────────────────────────── */}
      <section className="platform-hero">
        <div className="platform-hero-inner">
          <h1 className="platform-h1">
            One platform.<br />
            Five asset engines.
          </h1>
          <p className="platform-desc">
            WokGen is a multi-vertical AI asset generation platform.
            Choose your mode. Generate production-ready assets.
          </p>
          <div className="platform-cta-row">
            <Link href="/pixel/studio" className="btn-primary btn-lg">
              Start with Pixel Studio →
            </Link>
            <Link href="/business/studio" className="btn-ghost btn-lg">
              Business Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mode cards ────────────────────────────────────────────────── */}
      <section className="platform-modes">
        <div className="platform-modes-inner">
          <div className="platform-modes-grid">
            {MODES.map(mode => (
              <Link
                key={mode.id}
                href={mode.href}
                className={`platform-mode-card${mode.status === 'coming_soon' ? ' platform-mode-card--soon' : ''}`}
                style={{ '--mode-card-accent': mode.accent } as React.CSSProperties}
              >
                <div className="platform-mode-card-header">
                  <span className="platform-mode-icon">{mode.icon}</span>
                  <div>
                    <div className="platform-mode-label">{mode.label}</div>
                    <div className="platform-mode-tagline">{mode.tagline}</div>
                  </div>
                  {mode.status === 'coming_soon' && (
                    <span className="platform-mode-badge">Soon</span>
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
