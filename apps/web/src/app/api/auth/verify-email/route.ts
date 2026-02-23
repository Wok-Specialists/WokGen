/**
 * GET /api/auth/verify-email?token=<token>&email=<email>
 *
 * Verify a user's email address using the one-time token sent by
 * POST /api/auth/send-verification. Redirects to /account on success.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=InvalidVerificationLink', req.url));
  }

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!record) {
    return NextResponse.redirect(new URL('/login?error=InvalidVerificationLink', req.url));
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return NextResponse.redirect(new URL('/login?error=VerificationLinkExpired', req.url));
  }

  // Mark user email as verified
  await prisma.user.updateMany({
    where: { email, emailVerified: null },
    data:  { emailVerified: new Date() },
  });

  // Clean up the token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return NextResponse.redirect(new URL('/account?verified=1', req.url));
}
