import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Font Weight Tester',
  description: 'Preview any Google Font in all weights from 100 to 900. Load instantly and copy font-weight CSS.',
  openGraph: { title: 'Font Weight Tester — WokGen', description: 'Preview Google Fonts in all weights from 100–900.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import FontWeightTool from '@/components/tools/FontWeightTool';

export default function Page() {
  return (
    <ToolShell id="font-weight" label="Font Weight Tester" description="Type a Google Font name and preview it in all weights (100–900). Copy the CSS declaration." icon="FW">
      <FontWeightTool />
    </ToolShell>
  );
}
