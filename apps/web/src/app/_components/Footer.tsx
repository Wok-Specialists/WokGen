'use client';

import Link from 'next/link';

const footerLinks = [
  { label: 'wokspec.org', href: 'https://wokspec.org', external: true },
  { label: 'Docs',        href: '/docs',               external: false },
  { label: 'Gallery',     href: '/gallery',            external: false },
  { label: 'GitHub',      href: 'https://github.com/WokSpec/WokGen', external: true },
];

const linkStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontFamily: 'var(--font-heading)',
  transition: 'color 0.15s',
};

function hoverIn(e: React.MouseEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
}
function hoverOut(e: React.MouseEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
}

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-base)' }}>
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Attribution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="https://wokspec.org"
            style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-heading)', transition: 'color 0.15s' }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            Wok Specialists
          </a>
          <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem' }}>/</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6ee7b7', fontFamily: 'var(--font-heading)' }}>WokGen</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-disabled)', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '0.25rem', padding: '0.15rem 0.4rem', fontFamily: 'var(--font-heading)' }}>
            Early Preview · v0.1
          </span>
        </div>

        {/* Nav links */}
        <nav aria-label="Footer navigation" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {footerLinks.map(({ label, href, external }) =>
            external ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                {label}
              </a>
            ) : (
              <Link key={label} href={href} style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                {label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
