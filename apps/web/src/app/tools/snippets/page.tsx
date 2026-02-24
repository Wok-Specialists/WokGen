'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="snippets"
      label="Code Snippet Manager"
      description="Save, tag, and search code snippets with syntax highlighting."
      icon="📌"
    />
  );
}
