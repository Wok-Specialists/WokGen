import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isSelfHosted = process.env.SELF_HOSTED === 'true';

  // Self-hosted mode: no auth enforcement at all
  if (isSelfHosted) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect studio and API generation routes
  const needsAuth =
    pathname.startsWith('/studio') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/billing');

  if (needsAuth && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // API routes return 401 JSON, not redirect
  if (pathname.startsWith('/api/generate') && !session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/studio/:path*',
    '/account/:path*',
    '/billing/:path*',
    '/api/generate/:path*',
    '/api/generate',
  ],
};
