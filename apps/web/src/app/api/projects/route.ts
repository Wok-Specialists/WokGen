import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isSupportedMode } from '@/lib/modes';

// ---------------------------------------------------------------------------
// GET /api/projects — list user's projects
// POST /api/projects — create a new project
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const mode       = searchParams.get('mode') ?? undefined;
  const archived   = searchParams.get('archived') === 'true';

  const projects = await prisma.project.findMany({
    where: {
      userId:     session.user.id,
      isArchived: archived,
      ...(mode ? { mode } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { jobs: true } },
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, mode, description, settings } = body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required.' }, { status: 400 });
  }

  if (!isSupportedMode(mode)) {
    return NextResponse.json({ error: `Invalid mode "${mode}".` }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId:      session.user.id,
      mode:        mode as string,
      name:        String(name).trim(),
      description: typeof description === 'string' ? description.trim() || null : null,
      settings:    settings ? JSON.stringify(settings) : null,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
