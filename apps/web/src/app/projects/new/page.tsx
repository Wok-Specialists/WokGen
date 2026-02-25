import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';
import NewProjectClient from './_client';

export const metadata: Metadata = {
  title: 'New Project — WokGen',
};

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: { name?: string; brief?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/projects/new');

  return <NewProjectClient name={searchParams.name ?? ''} brief={searchParams.brief ?? ''} />;
}
