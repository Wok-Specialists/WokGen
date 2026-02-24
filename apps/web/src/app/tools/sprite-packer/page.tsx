'use client';
import ToolShell from '@/components/tools/ToolShell';
import SpritePackerTool from '@/components/tools/SpritePackerTool';
export default function Page() {
  return (
    <ToolShell id="sprite-packer" label="Sprite Sheet Packer" description="Upload PNGs → packed atlas with shelf algorithm. Export PNG + TexturePacker/CSS manifest. 100% browser-side." icon="🎮">
      <SpritePackerTool />
    </ToolShell>
  );
}
