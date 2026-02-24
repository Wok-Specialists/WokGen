import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'CSV Tools',
  description: 'View, convert, and analyze CSV files. CSV↔JSON↔YAML, column stats, find & replace.',
  openGraph: { title: 'CSV Tools — WokGen', description: 'View, convert, and analyze CSV files. CSV↔JSON↔YAML, column stats, find & replace.', type: 'website' },
};
import ToolShell from '@/components/tools/ToolShell';
import CsvTool from '@/components/tools/CsvTool';

export default function Page() {
  return (
    <ToolShell
      id="csv-tools"
      label="CSV / Data Tools"
      description="Convert CSV ↔ JSON ↔ YAML. Table viewer with sort and filter."
      icon="CSV"
    >
      <CsvTool />
    </ToolShell>
  );
}
