'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

const STUDIOS = [
  {
    href: '/pixel/studio',
    name: 'AI Generator',
    tagline: 'Sprites, tilesets & game assets',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/pixel/studio?tool=animate',
    name: 'Animator',
    tagline: 'Animated sprite GIFs, walk & idle cycles',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/pixel/studio?tool=scene',
    name: 'Scene Builder',
    tagline: 'Tilesets & environmental scenes',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/editor',
    name: 'Pixel Editor',
    tagline: 'Draw, animate, export — no install',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/pixel/palette',
    name: 'Palette Studio',
    tagline: 'Curated palettes, color extraction',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/pixel/atlas',
    name: 'Atlas Packer',
    tagline: 'Pack sprites into texture atlases',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/pixel/gallery',
    name: 'Gallery',
    tagline: 'Browse community pixel art',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
  {
    href: '/pixel/docs',
    name: 'Docs',
    tagline: 'Guides, tips & keyboard shortcuts',
    color: 'var(--accent, #a78bfa)',
    beta: false,
  },
] as const;

export function StudiosDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="nav-studios-trigger"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button type="button"
        className="nav-link nav-studios-btn"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Studio
        <svg
          className="nav-studios-chevron"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="studios-dropdown" role="menu">
          <div className="studios-dropdown-header">
            <span>WokGen Pixel Studio</span>
            <span className="studios-dropdown-header-sub">Create pixel art with AI</span>
          </div>
          <div className="studios-dropdown-modes-label">Tools</div>
          <div className="studios-dropdown-grid">
            {STUDIOS.map((studio) => (
              <Link
                key={studio.href}
                href={studio.href}
                className="studios-dropdown-card"
                role="menuitem"
                onClick={() => setOpen(false)}
                style={{ '--card-color': studio.color } as React.CSSProperties}
              >
                <div className="studios-dropdown-card-body">
                  <div className="studios-dropdown-card-name">
                    {studio.name}
                    {studio.beta && (
                      <span className="studios-dropdown-card-badge">beta</span>
                    )}
                  </div>
                  <div className="studios-dropdown-card-tagline">{studio.tagline}</div>
                </div>
                <span className="studios-dropdown-card-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
