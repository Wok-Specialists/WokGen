/**
 * GET  /api/keys          — list all API keys for the authenticated user
 * POST /api/keys          — create a new API key (returns raw key ONCE)
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateRawKey, hashKey } from '@/lib/api-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateKeySchema = z.object({
  name:      z.string().min(1).max(64),
  scopes:    z.array(z.enum(['generate', 'gallery:read', 'gallery:write', 'voice', 'text'])).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where:   { userId: session.user.id, active: true },
    select:  { id: true, name: true, prefix: true, scopes: true, lastUsedAt: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    keys: keys.map(k => ({
      ...k,
      scopes: (() => { try { return JSON.parse(k.scopes); } catch { return ['generate']; } })(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Limit to 10 active keys per user
  const count = await prisma.apiKey.count({ where: { userId: session.user.id, active: true } });
  if (count >= 10) {
    return NextResponse.json({ error: 'Maximum of 10 API keys allowed. Revoke an existing key first.' }, { status: 409 });
  }

  let body: z.infer<typeof CreateKeySchema>;
  try {
    body = CreateKeySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request', details: err instanceof Error ? err.message : undefined }, { status: 422 });
  }

  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const prefix = rawKey.slice(0, 12); // "wk_live_" + 4 hex chars

  const key = await prisma.apiKey.create({
    data: {
      userId:    session.user.id,
      name:      body.name,
      keyHash,
      prefix,
      scopes:    JSON.stringify(body.scopes ?? ['generate']),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    },
    select: { id: true, name: true, prefix: true, createdAt: true, expiresAt: true },
  });

  return NextResponse.json({
    ...key,
    // Raw key returned ONCE — never stored again
    key: rawKey,
    warning: 'Store this key securely. It will not be shown again.',
  }, { status: 201 });
}
