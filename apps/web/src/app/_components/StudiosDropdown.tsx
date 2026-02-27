'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

const STUDIOS = [
  {
    href: '/studio?type=pixel',
    name: 'Pixel',
    tagline: 'Game assets & sprite sheets',
    color: 'var(--yellow, #f59e0b)',
    beta: false,
  },
  {
    href: '/studio?type=business',
    name: 'Business',
    tagline: 'Logos, branding & brand kits',
    color: 'var(--blue, #3b82f6)',
    beta: false,
  },
  {
    href: '/studio?type=vector',
    name: 'Vector',
    tagline: 'Scalable icons & illustrations',
    color: 'var(--green, #10b981)',
    beta: false,
  },
  {
    href: '/studio?type=uiux',
    name: 'UI/UX',
    tagline: 'Components & design systems',
    color: 'var(--pink, #ec4899)',
    beta: false,
  },
  {
    href: '/studio?type=voice',
    name: 'Voice',
    tagline: 'AI voices & audio assets',
    color: 'var(--accent)',
    beta: true,
  },
  {
    href: '/studio?type=code',
    name: 'Text / Code',
    tagline: 'Copy, docs & content',
    color: 'var(--orange, #f97316)',
    beta: true,
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
            <span>WokGen Studio</span>
            <span className="studios-dropdown-header-sub">Select a mode</span>
          </div>
          <div className="studios-dropdown-modes-label">Modes</div>
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
