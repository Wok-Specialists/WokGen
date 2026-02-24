import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateSchema = z.object({
  title:   z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional(),
  color:   z.enum(['default','purple','blue','green','amber','red']).optional(),
  pinned:  z.boolean().optional(),
  tags:    z.array(z.string().max(50)).max(10).optional(),
});

async function getNote(noteId: string, userId: string) {
  return prisma.eralNote.findFirst({ where: { id: noteId, userId } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const note = await getNote(params.id, userId);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { tags, ...fields } = parsed.data;

  const updated = await prisma.eralNote.update({
    where: { id: params.id },
    data: {
      ...fields,
      ...(tags !== undefined && {
        tags: {
          deleteMany: {},
          create: tags.map((tag) => ({ tag })),
        },
      }),
    },
    include: { tags: { select: { tag: true } } },
  });

  return NextResponse.json({ note: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const note = await getNote(params.id, userId);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.eralNote.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
