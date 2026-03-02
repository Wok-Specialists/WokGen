import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  const { token } = await params;

  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/invite/${token}`);
  }

  const member = await prisma.projectMember.findFirst({
    where: { inviteToken: token, inviteStatus: 'pending' },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!member) {
    return (
      <div className="inv-wrap">
        <h1 className="inv-title">Invalid or expired invite</h1>
        <p style={{ color: 'var(--text-muted)' }}>This invite link has already been used or has expired.</p>
        <a href="/projects" className="inv-link" style={{ background: 'var(--accent)' }}>Go to Projects</a>
      </div>
    );
  }

  // Accept the invite
  await prisma.projectMember.update({
    where: { id: member.id },
    data: {
      userId: session.user.id,
      inviteStatus: 'accepted',
      inviteToken: null,
    },
  });

  redirect(`/projects/${member.project.id}`);
}
