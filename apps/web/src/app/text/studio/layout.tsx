import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Mode — WokGen Studio',
  description: 'Generate compelling copy, taglines, and brand messaging with AI.',
  openGraph: {
    title: 'Text Mode — WokGen Studio',
    description: 'Generate compelling copy, taglines, and brand messaging with AI.',
    images: [{ url: 'https://wokgen.wokspec.org/og.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Mode — WokGen Studio',
    description: 'Generate compelling copy, taglines, and brand messaging with AI.',
    images: ['https://wokgen.wokspec.org/og.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
