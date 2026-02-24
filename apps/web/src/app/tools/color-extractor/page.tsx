import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Color Extractor',
  description: 'Extract a color palette from any image. K-means clustering, runs entirely in your browser.',
  openGraph: { title: 'Color Extractor — WokGen', description: 'Extract a color palette from any image. Runs client-side.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import ColorExtractorTool from '@/components/tools/ColorExtractorTool';

export default function Page() {
  return (
    <ToolShell id="color-extractor" label="Color Extractor" description="Extract a color palette from any image using k-means clustering. No upload required." icon="CE">
      <ColorExtractorTool />
    </ToolShell>
  );
}
