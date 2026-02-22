import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'WokGen Vector — Scalable SVG Icons & Illustrations',
  description: 'Generate scalable SVG icon sets, illustration libraries, and design system components with AI.',
};

export default function VectorPage() {
  redirect('/vector/studio');
}
