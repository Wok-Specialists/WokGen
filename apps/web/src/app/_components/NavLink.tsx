'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + '/');

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={[
        'text-[0.8rem] font-medium px-2.5 py-1.5 rounded transition-colors inline-block',
        active
          ? 'text-[var(--accent)] shadow-[inset_0_-2px_0_0_var(--accent)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5',
      ].join(' ')}
      style={{ fontFamily: 'var(--font-heading)' }}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
