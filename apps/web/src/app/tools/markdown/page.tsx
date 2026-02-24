'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="markdown"
      label="Markdown Editor"
      description="Split-pane editor with live preview and GFM support."
      icon="📝"
    />
  );
}
