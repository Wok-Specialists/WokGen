'use client';
import ToolShell from '@/components/tools/ToolShell';
import FaviconTool from '@/components/tools/FaviconTool';

export default function Page() {
  return (
    <ToolShell
      id="favicon"
      label="Favicon Generator"
      description="Generate favicon.ico and PNG variants from any image."
      icon="⭐"
    >
      <FaviconTool />
    </ToolShell>
  );
}
