import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// GET  /api/brand   — list user's brand kits
// POST /api/brand   — create a brand kit
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const kits = await prisma.brandKit.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ kits });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: 'name is required.' }, { status: 400 });

  const { name, paletteJson, typography, styleGuide, industry, mood, projectId } = body;

  const kit = await prisma.brandKit.create({
    data: {
      userId: session.user.id,
      name,
      paletteJson: JSON.stringify(paletteJson ?? []),
      typography:  typography  ? JSON.stringify(typography) : null,
      styleGuide:  styleGuide  ?? null,
      industry:    industry    ?? null,
      mood:        mood        ?? null,
      projectId:   projectId   ?? null,
    },
  });
  return NextResponse.json({ kit }, { status: 201 });
}
