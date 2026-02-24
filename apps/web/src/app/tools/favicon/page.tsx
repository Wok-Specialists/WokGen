'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="favicon"
      label="Favicon Generator"
      description="Generate favicon.ico and PNG variants from any image."
      icon="⭐"
    />
  );
}
