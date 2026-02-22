import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Verify ownership helper
async function verifyOwnership(id: string, userId: string) {
  const workspace = await prisma.project.findUnique({ where: { id } });
  if (!workspace) return { error: 'Workspace not found', status: 404 };
  if (workspace.userId !== userId) return { error: 'Forbidden', status: 403 };
  return { workspace };
}

// PATCH /api/workspaces/[id] — rename
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const check = await verifyOwnership(params.id, session.user.id);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? '').trim();
  if (!name || name.length > 40) {
    return NextResponse.json({ error: 'Workspace name must be 1–40 characters' }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data:  { name },
  });

  return NextResponse.json({ workspace: { id: updated.id, name: updated.name } });
}

// DELETE /api/workspaces/[id] — soft-delete (isArchived = true)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const check = await verifyOwnership(params.id, session.user.id);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.project.update({
    where: { id: params.id },
    data:  { isArchived: true },
  });

  return NextResponse.json({ ok: true });
}
