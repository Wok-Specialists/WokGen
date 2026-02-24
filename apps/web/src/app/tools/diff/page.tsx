import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Text Diff — WokGen',
  description: 'Compare two texts side by side and see lines added, removed, and unchanged.',
};
import ToolShell from '@/components/tools/ToolShell';
import DiffTool from '@/components/tools/DiffTool';

export default function Page() {
  return (
    <ToolShell id="diff" label="Text Diff" description="Compare two texts and see added, removed, and unchanged lines highlighted." icon="DIFF">
      <DiffTool />
    </ToolShell>
  );
}
