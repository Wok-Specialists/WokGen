import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// GET    /api/projects/[id]/documents/[docId]
// PATCH  /api/projects/[id]/documents/[docId]
// DELETE /api/projects/[id]/documents/[docId]
// ---------------------------------------------------------------------------

const UpdateSchema = z.object({
  title:   z.string().min(1).max(200).optional(),
  content: z.string().max(500000).optional(),
  emoji:   z.string().max(10).optional(),
});

type Params = { params: { id: string; docId: string } };

async function getDoc(projectId: string, docId: string, userId: string) {
  return prisma.document.findFirst({ where: { id: docId, projectId, userId } });
}

export async function GET(
  _req: NextRequest,
  { params }: Params,
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const doc = await getDoc(params.id, params.docId, session.user.id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ document: doc });
}

export async function PATCH(
  req: NextRequest,
  { params }: Params,
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const doc = await getDoc(params.id, params.docId, session.user.id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.document.update({
    where: { id: params.docId },
    data: parsed.data,
  });
  return NextResponse.json({ document: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: Params,
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const doc = await getDoc(params.id, params.docId, session.user.id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.document.delete({ where: { id: params.docId } });
  return NextResponse.json({ ok: true });
}
