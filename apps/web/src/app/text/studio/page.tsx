import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import TextStudio from './_client';

export const metadata: Metadata = {
  title: 'Text Studio | WokGen',
  description: 'AI text generation studio — docs, copy, code, and structured content with real-time streaming.',
};

export default function TextStudioPage() {
  return (
    <ErrorBoundary context="Text Studio">
      <TextStudio />
    </ErrorBoundary>
  );
}
