import type { Metadata } from 'next';
import CommunityClient from './_client';

export const metadata: Metadata = {
  title: 'Community Gallery | WokGen',
  description: 'Browse AI-generated assets from the WokGen community. Pixel art, brand assets, vectors, UI components, voice, and more.',
};

export default function CommunityPage() {
  return <CommunityClient />;
}
