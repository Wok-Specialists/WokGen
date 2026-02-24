import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Icon Search',
  description: 'Search and copy Lucide icons as SVG, React JSX, or name. Filter by category. Pure client-side.',
  openGraph: { title: 'Icon Search — WokGen', description: 'Search Lucide icons and copy as SVG, JSX, or name.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import IconSearchTool from '@/components/tools/IconSearchTool';

export default function Page() {
  return (
    <ToolShell id="icon-search" label="Icon Search" description="Search and browse Lucide icons. Click to copy as SVG code, React JSX, or icon name. Filter by category." icon="ICO">
      <IconSearchTool />
    </ToolShell>
  );
}
