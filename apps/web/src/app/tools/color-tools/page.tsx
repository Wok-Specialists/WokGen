'use client';
import ToolShell from '@/components/tools/ToolShell';
import ColorTool from '@/components/tools/ColorTool';
export default function Page() {
  return (
    <ToolShell id="color-tools" label="Color Utilities" description="Hex/RGB/HSL/OKLCH converter, WCAG contrast checker, color harmonies, and palette generator." icon="🌈">
      <ColorTool />
    </ToolShell>
  );
}
