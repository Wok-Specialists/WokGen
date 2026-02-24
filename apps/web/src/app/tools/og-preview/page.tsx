'use client';
import ToolShell from '@/components/tools/ToolShell';
import OgPreviewTool from '@/components/tools/OgPreviewTool';

export default function Page() {
  return (
    <ToolShell
      id="og-preview"
      label="Open Graph Preview"
      description="Preview how your link looks on Twitter, Facebook, LinkedIn, Discord, and Slack."
      icon="👁️"
    >
      <OgPreviewTool />
    </ToolShell>
  );
}
