import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Image Diff',
  description: 'Compare two images side-by-side with an interactive drag slider. Great for before/after comparisons.',
  openGraph: { title: 'Image Diff — WokGen', description: 'Compare two images with a drag slider. Before/after comparison.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import ImageDiffTool from '@/components/tools/ImageDiffTool';

export default function Page() {
  return (
    <ToolShell id="image-diff" label="Image Diff" description="Compare two images side-by-side with an interactive slider. Perfect for before/after comparisons." icon="🔀">
      <ImageDiffTool />
    </ToolShell>
  );
}
