import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DocumentEditorClient from './_client';

interface Props { params: { id: string; docId: string } }

export async function generateMetadata({ params }: Props) {
  const doc = await prisma.document.findFirst({
    where: { id: params.docId, projectId: params.id },
    select: { title: true },
  });
  return { title: doc ? `${doc.title} — WokGen Docs` : 'Document — WokGen' };
}

export default async function DocumentPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/projects/${params.id}/docs/${params.docId}`);

  const doc = await prisma.document.findFirst({
    where: { id: params.docId, projectId: params.id, userId: session.user.id },
  });
  if (!doc) redirect(`/projects/${params.id}`);

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { name: true },
  });

  return (
    <DocumentEditorClient
      projectId={params.id}
      projectName={project?.name ?? 'Project'}
      docId={params.docId}
      initialTitle={doc.title}
      initialContent={doc.content}
      initialEmoji={doc.emoji ?? '📄'}
    />
  );
}
