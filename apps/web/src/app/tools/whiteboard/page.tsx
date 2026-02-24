'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="whiteboard"
      label="Infinite Whiteboard"
      description="Open-source infinite canvas powered by tldraw. Auto-saves locally."
      icon="🖊️"
    />
  );
}
