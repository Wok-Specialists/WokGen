'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

interface NavSection {
  label: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavSection;

const isSection = (e: NavEntry): e is NavSection => 'children' in e;

const NAV: NavEntry[] = [
  { label: 'Getting Started', href: '/docs/getting-started' },
  {
    label: 'Studio',
    children: [
      { label: 'Pixel', href: '/docs/pixel' },
      { label: 'Business', href: '/docs/business' },
      { label: 'Vector', href: '/docs/vector' },
      { label: 'UI/UX', href: '/docs/uiux' },
      { label: 'Voice', href: '/docs/voice' },
      { label: 'Text', href: '/docs/text' },
    ],
  },
  {
    label: 'Platform',
    children: [
      { label: 'Tools Guide', href: '/docs/tools' },
      { label: 'Eral', href: '/docs/eral' },
      { label: 'Projects', href: '/docs/projects' },
      { label: 'Automations', href: '/docs/automations' },
    ],
  },
  { label: 'API Reference', href: '/docs/api' },
  { label: 'Self-Hosting', href: '/docs/self-hosting' },
  { label: 'Changelog', href: '/docs/changelog' },
];

function CollapsibleSection({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const isChildActive = section.children.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isChildActive || section.label === 'Studio' || section.label === 'Platform');

  return (
    <div className="docs-sidebar-section">
      <button type="button"
        className="docs-sidebar-section-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {section.label}
        <span className={`docs-sidebar-section-chevron${open ? ' docs-sidebar-section-chevron--open' : ''}`}>
          ▶
        </span>
      </button>
      {open && (
        <div className="docs-sidebar-section-children">
          {section.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`docs-sidebar-link${pathname === child.href || pathname.startsWith(child.href + '/') ? ' docs-sidebar-link--active' : ''}`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocsNav() {
  const pathname = usePathname();

  return (
    <aside className="docs-sidebar">
      <Link href="/docs" className="docs-nav-home">
        WokGen Docs
      </Link>
      {NAV.map((entry) => {
        if (isSection(entry)) {
          return <CollapsibleSection key={entry.label} section={entry} pathname={pathname} />;
        }
        return (
          <Link
            key={entry.href}
            href={entry.href}
            className={`docs-sidebar-flat-link${pathname === entry.href || pathname.startsWith(entry.href + '/') ? ' docs-sidebar-flat-link--active' : ''}`}
          >
            {entry.label}
          </Link>
        );
      })}
    </aside>
  );
}
