import type { Metadata } from 'next';
import { EralPage } from './_client';

export const metadata: Metadata = {
  title: 'WokGen Eral — AI Companion by WokSpec',
  description:
    'Ask anything. Create prompts. Get design help. Eral 7c is your AI companion for creative work.',
};

export default function Eral() {
  return <EralPage />;
}
