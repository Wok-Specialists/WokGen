'use client';
import ToolShell from '@/components/tools/ToolShell';
import ImageConverterTool from '@/components/tools/ImageConverterTool';

export default function Page() {
  return (
    <ToolShell
      id="image-converter"
      label="Image Converter"
      description="Convert between PNG, JPG, WebP, GIF, and AVIF. Batch up to 10 files."
      icon="🔄"
    >
      <ImageConverterTool />
    </ToolShell>
  );
}
