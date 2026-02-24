'use client';
import ToolShell from '@/components/tools/ToolShell';
import MarkdownTool from '@/components/tools/MarkdownTool';

export default function Page() {
  return (
    <ToolShell
      id="markdown"
      label="Markdown Editor"
      description="Split-pane editor with live preview, GFM support, toolbar, and export."
      icon="📝"
    >
      <MarkdownTool />
    </ToolShell>
  );
}
