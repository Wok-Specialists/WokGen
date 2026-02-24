import type { Metadata } from 'next';
import OgAnalyzerTool from '@/components/tools/OgAnalyzerTool';

export const metadata: Metadata = {
  title: 'OG Analyzer — WokGen',
  description: 'Fetch any URL and inspect all Open Graph and Twitter meta tags. Preview how it looks on social.',
};

export default function Page() {
  return <OgAnalyzerTool />;
}
