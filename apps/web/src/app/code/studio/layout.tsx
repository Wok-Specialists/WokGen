import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Studio — WokGen',
  description: 'Generate components, boilerplate, SQL, docs, and code with AI.',
};

export default function CodeStudioLayout({ children }: { children: React.ReactNode }) {
  return <div data-mode="code">{children}</div>;
}
