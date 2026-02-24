'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="image-compress"
      label="Image Compressor"
      description="Compress images with a quality slider. Live before/after size comparison."
      icon="🗜️"
    />
  );
}
