import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Gradient Animator',
  description: 'Animate CSS gradients with keyframe transitions. Color stops, angle control, speed slider, copy @keyframes CSS.',
  openGraph: { title: 'Gradient Animator — WokGen', description: 'Build animated CSS gradient @keyframes with live preview.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import GradientAnimatorTool from '@/components/tools/GradientAnimatorTool';

export default function Page() {
  return (
    <ToolShell id="gradient-animator" label="Gradient Animator" description="Create animated CSS gradients. Control color stops, angle, and animation speed. Copy the @keyframes CSS." icon="ANM">
      <GradientAnimatorTool />
    </ToolShell>
  );
}
