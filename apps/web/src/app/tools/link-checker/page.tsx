import type { Metadata } from 'next';
import LinkCheckerTool from '@/components/tools/LinkCheckerTool';

export const metadata: Metadata = {
  title: 'Link Checker — WokGen',
  description: 'Check HTTP status codes for a list of URLs. Runs entirely in your browser.',
};

export default function Page() {
  return <LinkCheckerTool />;
}
