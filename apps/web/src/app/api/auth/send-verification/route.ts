/**
 * POST /api/auth/send-verification
 *
 * Send (or resend) an email verification link to the current user's email.
 * Rate limited: 3 sends per hour per user.
 * Uses NextAuth's VerificationToken model to store the one-time token.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmailVerification } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { email, emailVerified } = await prisma.user.findUniqueOrThrow({
    where:  { id: session.user.id },
    select: { email: true, emailVerified: true },
  });

  if (emailVerified) {
    return NextResponse.json({ message: 'Email already verified.' });
  }

  if (!email) {
    return NextResponse.json({ error: 'No email address on file.' }, { status: 400 });
  }

  const rl = await checkRateLimit(`email-verify:${session.user.id}`, 3, 3600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit. Retry in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 3600) } },
    );
  }

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 86_400_000); // 24h

  await prisma.verificationToken.upsert({
    where:  { identifier_token: { identifier: email, token } },
    update: { expires },
    create: { identifier: email, token, expires },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://wokgen.wokspec.org';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmailVerification(email, verifyUrl);

  return NextResponse.json({ ok: true, message: 'Verification email sent.' });
}
