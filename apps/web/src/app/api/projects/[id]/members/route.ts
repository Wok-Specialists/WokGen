import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// GET    /api/projects/[id]/members   — list members
// POST   /api/projects/[id]/members   — add/invite a member
// DELETE /api/projects/[id]/members   — remove a member (?userId=)
// ---------------------------------------------------------------------------

async function sendInviteEmail(opts: { to: string; projectName: string; inviterName: string; token: string }) {
  if (!process.env.RESEND_API_KEY) return; // graceful no-op
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const acceptUrl = `${process.env.NEXTAUTH_URL ?? 'https://wokgen.app'}/invite/${opts.token}`;
    await resend.emails.send({
      from: 'WokGen <noreply@wokgen.app>',
      to: opts.to,
      subject: `${opts.inviterName} invited you to ${opts.projectName}`,
      html: `<p>You've been invited to collaborate on <strong>${opts.projectName}</strong>.</p>
             <p><a href="${acceptUrl}">Accept invitation</a></p>
             <p>This link expires in 7 days.</p>`,
    });
  } catch {
    // email failure must not fail the API
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  // Owner or any member can view the member list
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } });
  const asMember = !project
    ? await prisma.projectMember.findFirst({ where: { projectId: params.id, userId: session.user.id } })
    : null;
  if (!project && !asMember) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const members = await prisma.projectMember.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  // Enrich with user display info
  const userIds = members.map(m => m.userId).filter((id): id is string => id !== null);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    take: 50,
    select: { id: true, name: true, email: true, image: true },
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const enriched = members.map(m => ({ ...m, user: m.userId ? userMap[m.userId] ?? null : null }));
  return NextResponse.json({ members: enriched });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  // Only the project owner can add members
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: 'Not found or not owner.' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const { email, role = 'editor' } = body ?? {};
  if (!email) return NextResponse.json({ error: 'email is required.' }, { status: 400 });
  if (!['owner', 'editor', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'role must be owner, editor, or viewer.' }, { status: 400 });
  }

  const invitee = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!invitee) {
    // User doesn't exist yet — create pending invite
    const inviteToken = randomBytes(32).toString('hex');
    const member = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        role,
        invitedBy: session.user.id,
        inviteToken,
        inviteStatus: 'pending',
      },
    });
    // Send invite email to non-existent user
    await sendInviteEmail({
      to: email,
      projectName: project.name,
      inviterName: session.user.name ?? session.user.email ?? 'A user',
      token: inviteToken,
    });
    return NextResponse.json({ member, inviteSent: true }, { status: 201 });
  }

  if (invitee.id === session.user.id) {
    return NextResponse.json({ error: 'You are already the project owner.' }, { status: 400 });
  }

  const inviteToken = randomBytes(32).toString('hex');
  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: params.id, userId: invitee.id } },
    create: {
      projectId: params.id,
      userId: invitee.id,
      role,
      invitedBy: session.user.id,
      inviteToken,
      inviteStatus: 'pending',
    },
    update: { role },
  });

  // Send invite email to existing user
  await sendInviteEmail({
    to: email,
    projectName: project.name,
    inviterName: session.user.name ?? session.user.email ?? 'A user',
    token: inviteToken,
  });

  return NextResponse.json({ member, inviteSent: true }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: 'Not found or not owner.' }, { status: 404 });

  const targetUserId = new URL(req.url).searchParams.get('userId');
  if (!targetUserId) return NextResponse.json({ error: 'userId query param required.' }, { status: 400 });

  await prisma.projectMember.deleteMany({ where: { projectId: params.id, userId: targetUserId } });
  return NextResponse.json({ ok: true });
}
