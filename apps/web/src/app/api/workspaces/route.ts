import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getWorkspaceLimit, getUserPlanId } from '@/lib/plan-limits';

const VALID_MODES = new Set(['pixel', 'business', 'vector', 'emoji', 'uiux']);

// GET /api/workspaces?mode=pixel
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const mode = req.nextUrl.searchParams.get('mode') ?? '';
  if (!VALID_MODES.has(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  const workspaces = await prisma.project.findMany({
    where:   { userId: session.user.id, mode, isArchived: false },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { jobs: true } } },
  });

  return NextResponse.json({
    workspaces: workspaces.map(w => ({
      id:        w.id,
      name:      w.name,
      mode:      w.mode,
      jobCount:  w._count.jobs,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    })),
  });
}

// POST /api/workspaces
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? '').trim();
  const mode = (body.mode ?? '').trim();

  if (!name || name.length > 40) {
    return NextResponse.json({ error: 'Workspace name must be 1–40 characters' }, { status: 400 });
  }
  if (!VALID_MODES.has(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  const userId = session.user.id;

  // Enforce plan limit
  const [limit, planId, existingCount] = await Promise.all([
    getWorkspaceLimit(userId),
    getUserPlanId(userId),
    prisma.project.count({ where: { userId, mode, isArchived: false } }),
  ]);

  if (existingCount >= limit) {
    return NextResponse.json(
      {
        error:   `Workspace limit reached (${existingCount}/${limit}). Upgrade to unlock more.`,
        limit,
        plan:    planId,
        current: existingCount,
      },
      { status: 403 },
    );
  }

  const workspace = await prisma.project.create({
    data: { userId, mode, name },
    include: { _count: { select: { jobs: true } } },
  });

  return NextResponse.json({
    workspace: {
      id:        workspace.id,
      name:      workspace.name,
      mode:      workspace.mode,
      jobCount:  workspace._count.jobs,
      createdAt: workspace.createdAt.toISOString(),
    },
  });
}
