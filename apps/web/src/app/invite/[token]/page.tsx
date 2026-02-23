import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/invite/${params.token}`);
  }

  const member = await prisma.projectMember.findFirst({
    where: { inviteToken: params.token, inviteStatus: 'pending' },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!member) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Invalid or expired invite</h1>
        <p style={{ color: 'var(--text-muted)' }}>This invite link has already been used or has expired.</p>
        <a href="/projects" style={{ display: 'inline-block', marginTop: 24, padding: '10px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Go to Projects</a>
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
