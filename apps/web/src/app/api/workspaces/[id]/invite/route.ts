import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/workspaces/[id]/invite
// Body: { email: string, role?: 'member' | 'admin' }
// Auth: project owner only
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  if (project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email: string = (body.email ?? '').trim().toLowerCase();
  const role: string = body.role === 'admin' ? 'admin' : 'member';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  // Expire invitations after 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.workspaceInvitation.create({
    data: { projectId: params.id, email, role, expiresAt },
  });

  return NextResponse.json({ invitation: { id: invitation.id, email, role, token: invitation.token, expiresAt } }, { status: 201 });
}

// GET /api/workspaces/[id]/invite — list pending invitations
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  if (project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { projectId: params.id, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
  });

  return NextResponse.json({ invitations });
}
