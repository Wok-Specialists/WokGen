'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="csv-tools"
      label="CSV / Data Tools"
      description="Convert CSV ↔ JSON ↔ YAML. Table viewer with sort and filter."
      icon="📊"
    />
  );
}
