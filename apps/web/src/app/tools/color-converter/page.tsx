import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Color Converter — WokGen',
  description: 'Convert colors between HEX, RGB, HSL, and HSV formats with a live color preview.',
};
import ToolShell from '@/components/tools/ToolShell';
import ColorConverterTool from '@/components/tools/ColorConverterTool';

export default function Page() {
  return (
    <ToolShell id="color-converter" label="Color Converter" description="Convert colors between HEX, RGB, HSL, and HSV. Live preview and copy each format." icon="CLR">
      <ColorConverterTool />
    </ToolShell>
  );
}
