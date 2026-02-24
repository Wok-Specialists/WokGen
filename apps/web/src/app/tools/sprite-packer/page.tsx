'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="sprite-packer"
      label="Sprite Sheet Packer"
      description="Pack multiple PNGs into a sprite atlas with JSON coordinates."
      icon="🧩"
    />
  );
}
