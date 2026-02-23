/**
 * DELETE /api/keys/[id] — revoke an API key
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const key = await prisma.apiKey.findUnique({
    where:  { id: params.id },
    select: { id: true, userId: true },
  });

  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id: params.id },
    data:  { active: false },
  });

  return NextResponse.json({ ok: true, message: 'API key revoked.' });
}
