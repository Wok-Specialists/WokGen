import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Gradient Generator',
  description: 'Build CSS gradients (linear, radial, conic) with live preview. Adjust stops and copy CSS.',
  openGraph: { title: 'Gradient Generator — WokGen', description: 'Build CSS gradients with live preview. Copy CSS instantly.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import GradientGeneratorTool from '@/components/tools/GradientGeneratorTool';

export default function Page() {
  return (
    <ToolShell id="gradient-generator" label="Gradient Generator" description="Build CSS gradients (linear, radial, conic) with live preview. Adjust color stops and copy CSS." icon="FAV">
      <GradientGeneratorTool />
    </ToolShell>
  );
}
