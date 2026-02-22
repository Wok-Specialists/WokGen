'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODES_LIST } from '@/lib/modes';

// ---------------------------------------------------------------------------
// ModeSwitcher — horizontal tab bar below the NavBar
//
// Design System rules:
// - Chrome layer is UNCHANGED (nav, colors, spacing — all identical)
// - Mode accent color used ONLY for: active tab indicator line + label text
// - Inactive modes: muted, same weight
// - Coming Soon modes: dimmed, non-interactive
// - Mobile: horizontal scroll, no wrapping
// ---------------------------------------------------------------------------

export function ModeSwitcher() {
  const pathname = usePathname();

  // Derive active mode from URL prefix
  const activeMode = MODES_LIST.find(m => pathname.startsWith(m.routes.landing))?.id ?? null;

  return (
    <div className="mode-switcher" role="navigation" aria-label="Product mode">
      <div className="mode-switcher-inner">
        {MODES_LIST.map(mode => {
          const isActive  = activeMode === mode.id;
          const isSoon    = mode.status === 'coming_soon';

          return (
            <div key={mode.id} className="mode-tab-wrapper">
              {isSoon ? (
                <span
                  className={`mode-tab mode-tab--soon`}
                  aria-disabled="true"
                  title={`${mode.label} — Coming Soon`}
                >
                  {mode.shortLabel}
                  <span className="mode-tab-badge">Soon</span>
                </span>
              ) : (
                <Link
                  href={mode.routes.landing}
                  className={`mode-tab${isActive ? ' mode-tab--active' : ''}`}
                  style={isActive ? { '--tab-accent': mode.accentColor } as React.CSSProperties : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {mode.shortLabel}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
