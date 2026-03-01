import type { Metadata } from 'next';
import { AssetsClient } from './_client';

export const metadata: Metadata = {
  title: 'Asset Library — WokGen',
  description: 'Search 5M+ free CC0 images, illustrations, vectors, and videos from Pixabay.',
};

export default function AssetsPage() {
  return <AssetsClient />;
}
