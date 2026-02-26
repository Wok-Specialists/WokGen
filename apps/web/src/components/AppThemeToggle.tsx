'use client';

import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

// App routes where the theme toggle should be visible.
const APP_ROUTE_PREFIXES = [
  '/studio',
  '/account',
  '/dashboard',
  '/projects',
  '/library',
  '/eral',
  '/admin',
  '/settings',
];

export default function AppThemeToggle() {
  const pathname = usePathname();
  const isAppRoute = APP_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isAppRoute) return null;
  return <ThemeToggle />;
}
