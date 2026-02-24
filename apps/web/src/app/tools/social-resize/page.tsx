'use client';
import ToolShell from '@/components/tools/ToolShell';
import SocialResizeTool from '@/components/tools/SocialResizeTool';
export default function Page() {
  return (
    <ToolShell id="social-resize" label="Social Media Resizer" description="Upload once, export for every platform. 14 presets across Instagram, Twitter/X, YouTube, TikTok, LinkedIn, Facebook, and more." icon="📱">
      <SocialResizeTool />
    </ToolShell>
  );
}
