import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s — Tools · WokGen', default: 'Free Creator Tools — WokGen' },
  description:
    'Browser-native tools for creators, developers, and game devs. Background remover, image converter, CSS generator, JSON toolkit, PDF tools, and 30+ more. All free, all private — processing happens in your browser.',
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
