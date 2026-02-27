export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import LibraryClient from './_client';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Asset Library | WokGen',
  description: 'All your generated and saved assets in one place.',
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return <ErrorBoundary context="Library"><LibraryClient /></ErrorBoundary>;
}
