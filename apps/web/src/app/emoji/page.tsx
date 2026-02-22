import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'WokGen Emoji — Custom Emoji & Icon Packs',
  description: 'Generate custom emoji packs, reaction sets, Discord/Slack icons, and app icon sets with AI.',
};

export default function EmojiPage() {
  redirect('/emoji/studio');
}
