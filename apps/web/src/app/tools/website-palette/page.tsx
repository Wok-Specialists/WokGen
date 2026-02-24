import type { Metadata } from 'next';
import WebsitePaletteTool from '@/components/tools/WebsitePaletteTool';

export const metadata: Metadata = {
  title: 'Website Palette — WokGen',
  description: 'Extract color palette from any website by scanning its HTML and CSS.',
};

export default function Page() {
  return <WebsitePaletteTool />;
}
