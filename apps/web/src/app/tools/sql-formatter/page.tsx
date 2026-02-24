import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'SQL Formatter — WokGen',
  description: 'Format and prettify SQL queries with keyword capitalization and proper indentation.',
};
import ToolShell from '@/components/tools/ToolShell';
import SqlFormatterTool from '@/components/tools/SqlFormatterTool';

export default function Page() {
  return (
    <ToolShell id="sql-formatter" label="SQL Formatter" description="Format and prettify SQL queries. Capitalizes keywords and adds proper indentation." icon="SQL">
      <SqlFormatterTool />
    </ToolShell>
  );
}
