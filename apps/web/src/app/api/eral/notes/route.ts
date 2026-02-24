import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const CreateSchema = z.object({
  title:   z.string().min(1).max(200).default('Untitled'),
  content: z.string().max(50000).default(''),
  color:   z.enum(['default','purple','blue','green','amber','red']).default('default'),
  tags:    z.array(z.string().max(50)).max(10).default([]),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const notes = await prisma.eralNote.findMany({
    where: { userId },
    include: { tags: { select: { tag: true } } },
    orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    take: 200,
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, content, color, tags } = parsed.data;

  const note = await prisma.eralNote.create({
    data: {
      userId,
      title,
      content,
      color,
      tags: {
        create: tags.map((tag) => ({ tag })),
      },
    },
    include: { tags: { select: { tag: true } } },
  });

  return NextResponse.json({ note }, { status: 201 });
}
