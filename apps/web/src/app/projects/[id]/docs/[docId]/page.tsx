import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DocumentEditorClient from './_client';

interface Props { params: Promise<{ id: string; docId: string }> }

export async function generateMetadata({ params }: Props) {
  const { id, docId } = await params;
  const doc = await prisma.document.findFirst({
    where: { id: docId, projectId: id },
    select: { title: true },
  });
  return { title: doc ? `${doc.title} — WokGen Docs` : 'Document — WokGen' };
}

export default async function DocumentPage({ params }: Props) {
  const { id, docId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/projects/${id}/docs/${docId}`);

  const doc = await prisma.document.findFirst({
    where: { id: docId, projectId: id, userId: session.user.id },
  });
  if (!doc) redirect(`/projects/${id}`);

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    select: { name: true },
  });

  return (
    <DocumentEditorClient
      projectId={id}
      projectName={project?.name ?? 'Project'}
      docId={docId}
      initialTitle={doc.title}
      initialContent={doc.content}
      initialEmoji={doc.emoji ?? 'Document'}
    />
  );
}
