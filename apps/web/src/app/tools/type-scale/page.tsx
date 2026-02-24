import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Type Scale',
  description: 'Generate a visual typography scale from a base size and ratio. Export as CSS custom properties.',
  openGraph: { title: 'Type Scale — WokGen', description: 'Generate a visual typography scale. Export as CSS variables.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import TypeScaleTool from '@/components/tools/TypeScaleTool';

export default function Page() {
  return (
    <ToolShell id="type-scale" label="Type Scale" description="Generate a visual typography scale from a base size and modular ratio. Export as CSS variables." icon="TYP">
      <TypeScaleTool />
    </ToolShell>
  );
}
