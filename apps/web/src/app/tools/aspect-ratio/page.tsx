import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Aspect Ratio Calculator',
  description: 'Calculate aspect ratios and dimensions. Common ratios, social media presets, and dimension converter.',
  openGraph: { title: 'Aspect Ratio Calculator — WokGen', description: 'Calculate aspect ratios and match social media dimensions.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import AspectRatioTool from '@/components/tools/AspectRatioTool';

export default function Page() {
  return (
    <ToolShell id="aspect-ratio" label="Aspect Ratio Calculator" description="Calculate dimensions for any aspect ratio. Standard presets, social media sizes, and visual preview." icon="AR">
      <AspectRatioTool />
    </ToolShell>
  );
}
