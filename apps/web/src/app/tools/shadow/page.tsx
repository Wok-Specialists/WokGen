import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'CSS Shadow Generator',
  description: 'Build box-shadow and text-shadow CSS with live preview. Multiple layers, color picker, copy CSS.',
  openGraph: { title: 'CSS Shadow Generator — WokGen', description: 'Build box-shadow and text-shadow with live preview.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import ShadowGeneratorTool from '@/components/tools/ShadowGeneratorTool';

export default function Page() {
  return (
    <ToolShell id="shadow" label="CSS Shadow Generator" description="Build box-shadow and text-shadow with visual sliders. Add multiple layers and copy CSS instantly." icon="SHD">
      <ShadowGeneratorTool />
    </ToolShell>
  );
}
