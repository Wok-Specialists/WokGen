import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import LibraryClient from './_client';

export const metadata: Metadata = {
  title: 'Asset Library | WokGen',
  description: 'All your generated and saved assets in one place.',
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return <LibraryClient />;
}
