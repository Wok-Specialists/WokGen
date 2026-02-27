import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import UnifiedStudioClient from './_shell';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WokGen Studio',
  description: 'AI creative studio for game developers and indie builders.',
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

const VALID_TYPES = ['pixel', 'vector', 'uiux', 'voice', 'business', 'code'] as const;
type StudioType = (typeof VALID_TYPES)[number];

function isValidType(t: string | undefined): t is StudioType {
  return VALID_TYPES.includes(t as StudioType);
}

export default async function StudioPage({ searchParams }: Props) {
  const { type } = await searchParams;
  if (!isValidType(type)) redirect('/studio?type=pixel');

  return (
    <ErrorBoundary context="Studio">
      <Suspense>
        <UnifiedStudioClient type={type} />
      </Suspense>
    </ErrorBoundary>
  );
}
