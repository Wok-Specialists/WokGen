import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { log as logger } from '@/lib/logger';

// POST /api/pro-waitlist — stores email in WaitlistEntry with mode='pro'
export async function POST(req: NextRequest) {
  let email: string | undefined;
  try {
    const body = await req.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO "WaitlistEntry" (id, email, mode, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${email}, 'pro', now(), now())
      ON CONFLICT (email) DO UPDATE SET mode = 'pro', "updatedAt" = now()
    `;
  } catch (err) {
    logger.error({ email, err }, '[pro-waitlist] db error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
