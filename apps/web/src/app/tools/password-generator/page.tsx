import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Password Generator — WokGen',
  description: 'Generate secure passwords with customizable length and character sets. Uses crypto.getRandomValues().',
};
import ToolShell from '@/components/tools/ToolShell';
import PasswordGeneratorTool from '@/components/tools/PasswordGeneratorTool';

export default function Page() {
  return (
    <ToolShell id="password-generator" label="Password Generator" description="Generate strong passwords with customizable length and character sets. Pure client-side using crypto.getRandomValues()." icon="PWD">
      <PasswordGeneratorTool />
    </ToolShell>
  );
}
