'use client';
import ToolShell from '@/components/tools/ToolShell';
import TextTool from '@/components/tools/TextTool';
export default function Page() {
  return (
    <ToolShell id="text-tools" label="Text Utilities" description="Word counter, case formats, slug generator, dedup lines, extract URLs and emails." icon="✍️">
      <TextTool />
    </ToolShell>
  );
}
