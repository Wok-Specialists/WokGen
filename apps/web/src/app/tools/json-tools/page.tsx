'use client';

import ToolShell from '@/components/tools/ToolShell';
import JsonTool from '@/components/tools/JsonTool';

export default function Page() {
  return (
    <ToolShell
      id="json-tools"
      label="JSON Toolkit"
      description="Format, validate, minify, diff, and convert JSON. All client-side — nothing leaves your browser."
      icon="{ }"
    >
      <JsonTool />
    </ToolShell>
  );
}
