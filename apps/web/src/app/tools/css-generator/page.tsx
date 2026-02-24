'use client';
import ToolShell from '@/components/tools/ToolShell';
import CssGeneratorTool from '@/components/tools/CssGeneratorTool';
export default function Page() {
  return (
    <ToolShell id="css-generator" label="CSS Generator Suite" description="Gradient, glassmorphism, box shadow, border radius, and animation builders." icon="✨">
      <CssGeneratorTool />
    </ToolShell>
  );
}
