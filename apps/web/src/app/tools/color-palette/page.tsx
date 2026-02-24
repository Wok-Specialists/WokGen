'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="color-palette"
      label="Color Palette Extractor"
      description="Extract dominant colors from any image. Export as CSS, JSON, or Tailwind."
      icon="🎨"
    />
  );
}
