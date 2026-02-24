import type { Metadata } from 'next';
import UuidGeneratorTool from '@/components/tools/UuidGeneratorTool';

export const metadata: Metadata = {
  title: 'UUID Generator — WokGen',
  description: 'Generate cryptographically random UUID v4 values in your browser.',
};

export default function Page() {
  return <UuidGeneratorTool />;
}
