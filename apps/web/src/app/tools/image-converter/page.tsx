'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="image-converter"
      label="Image Converter"
      description="Convert between PNG, JPG, WebP, GIF, and AVIF. Batch up to 10 files."
      icon="🔄"
    />
  );
}
