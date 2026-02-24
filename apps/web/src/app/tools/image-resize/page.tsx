'use client';
import ToolShell from '@/components/tools/ToolShell';
import ImageResizeTool from '@/components/tools/ImageResizeTool';

export default function Page() {
  return (
    <ToolShell
      id="image-resize"
      label="Image Resizer"
      description="Resize and crop images with social media presets."
      icon="↔️"
    >
      <ImageResizeTool />
    </ToolShell>
  );
}
