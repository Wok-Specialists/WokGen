'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="image-resize"
      label="Image Resizer"
      description="Resize and crop images with social media presets."
      icon="↔️"
    />
  );
}
