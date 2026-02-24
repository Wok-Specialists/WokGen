'use client';
import ToolShell from '@/components/tools/ToolShell';
import GeneratorsTool from '@/components/tools/GeneratorsTool';
export default function Page() {
  return (
    <ToolShell id="generators" label="Developer Generators" description="UUID, password generator, Lorem ipsum, CRON builder, timestamp converter, diff." icon="⚡">
      <GeneratorsTool />
    </ToolShell>
  );
}
