'use client';
import ToolShell from '@/components/tools/ToolShell';
import CsvTool from '@/components/tools/CsvTool';

export default function Page() {
  return (
    <ToolShell
      id="csv-tools"
      label="CSV / Data Tools"
      description="Convert CSV ↔ JSON ↔ YAML. Table viewer with sort and filter."
      icon="📊"
    >
      <CsvTool />
    </ToolShell>
  );
}
