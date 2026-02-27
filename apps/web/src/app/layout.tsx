import type { Metadata, Viewport } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { NavLink } from './_components/NavLink';
import { Footer } from './_components/Footer';
import { NavAuth } from './_components/NavAuth';
import { Providers } from './_components/Providers';
import { MobileNav } from './_components/MobileNav';
import { Breadcrumb } from './_components/Breadcrumb';
import { Toaster } from 'sonner';
import { PageLoadingBar } from '@/components/PageLoadingBar';
import AppThemeToggle from '@/components/AppThemeToggle';
import { StudiosDropdown } from './_components/StudiosDropdown';
import { CmdKButton } from './_components/CmdKButton';

const EralCompanion = nextDynamic(
  () => import('@/components/EralCompanion').then((m) => ({ default: m.EralCompanion })),
  { ssr: false },
);

const CommandPalette = nextDynamic(
  () => import('./_components/CommandPalette'),
  { ssr: false },
);

const KeyboardShortcuts = nextDynamic(
  () => import('./_components/KeyboardShortcuts'),
  { ssr: false },
);

const OnboardingGate = nextDynamic(
  () => import('./_components/OnboardingGate'),
  { ssr: false },
);

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: {
    template: '%s — WokGen',
    default: 'WokGen — AI Asset Generation',
  },
  description: 'Generate pixel art, vectors, UI mockups, brand assets, voice, 3D models and more with AI.',
  metadataBase: new URL('https://wokgen.wokspec.org'),
  keywords: [
    'AI asset generator',
    'pixel art generator',
    'AI logo generator',
    'brand kit AI',
    'game asset generator',
    'sprite generator',
    'AI image generation',
    'WokGen',
    'WokSpec',
  ],
  authors: [{ name: 'Wok Specialists', url: 'https://wokspec.org' }],
  creator: 'Wok Specialists',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://wokgen.wokspec.org',
    title: 'WokGen — AI Asset Generation Platform',
    description: 'Generate game assets, brand kits, icons, and UI components with AI.',
    siteName: 'WokGen',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'WokGen — AI Asset Generation Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WokGen — AI Asset Generation Platform',
    description: 'Generate game assets, brand kits, icons, and UI components with AI.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

// ---------------------------------------------------------------------------
// Nav bar (Server Component — no client state needed)
// ---------------------------------------------------------------------------
function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center h-[50px] px-5 border-b border-[var(--border)] backdrop-blur-xl gap-1 flex-shrink-0"
      style={{ background: 'rgba(10,10,10,0.92)', fontFamily: 'var(--font-heading)' }}
      aria-label="Main navigation"
    >
      {/* Back to WokSpec */}
      <a
        href="https://wokspec.org"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 hidden sm:flex items-center gap-1 text-[0.7rem] font-medium px-2 py-1 rounded mr-1 border border-[var(--border)] text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
        style={{ textDecoration: 'none' }}
        aria-label="Back to WokSpec"
      >
        ← WokSpec
      </a>

      {/* Wordmark */}
      <Link
        href="/"
        className="flex-shrink-0 flex items-center text-sm font-bold tracking-tight mr-3"
        style={{ textDecoration: 'none' }}
        aria-label="WokGen home"
      >
        <span style={{ color: 'var(--text-muted)' }}>Wok</span>
        <span style={{ color: 'var(--accent)' }}>Gen</span>
      </Link>

      {/* Nav links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-0.5">
        <StudiosDropdown />
        <NavLink href="/tools">Tools</NavLink>
        <NavLink href="/eral">Eral</NavLink>
        <NavLink href="/community">Community</NavLink>
        <span
          className="text-[0.8rem] font-medium px-2.5 py-1.5 rounded text-[var(--text-muted)] opacity-50 cursor-default inline-flex items-center gap-1.5"
          title="Browser extension — in development"
        >
          Extension
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            background: 'var(--accent-subtle, rgba(129,140,248,0.12))',
            color: 'var(--accent)',
            border: '1px solid var(--accent-glow, rgba(129,140,248,0.25))',
            borderRadius: '4px',
            padding: '1px 5px',
            lineHeight: 1.4,
          }}>
            DEV
          </span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="hidden sm:inline-flex"><CmdKButton /></span>
        <AppThemeToggle />
        <NavAuth />
        <MobileNav />
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable}`} data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var p=window.location.pathname;var pub=['/','/login','/pricing','/changelog','/open-source','/status','/tools','/community','/docs'];var isPublic=p==='/'||pub.some(function(r){return p===r||p.startsWith(r+'/');});if(!isPublic){var t=localStorage.getItem('wokgen-theme');if(t){var resolved=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',resolved);}}}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={dmSans.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <PageLoadingBar />
        <Providers>
          <a href="#main-content" className="skip-to-content">Skip to content</a>
          <NavBar />
          <Breadcrumb />
          <main id="main-content" style={{ flex: 1 }}>{children}</main>
          <Footer />
          <EralCompanion />
          <CommandPalette />
          <KeyboardShortcuts />
          <OnboardingGate />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: { background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-sans)' },
            }}
          />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
