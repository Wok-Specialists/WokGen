import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Cron Builder — WokGen',
  description: 'Build and validate cron expressions with human-readable descriptions and next run dates.',
};
import ToolShell from '@/components/tools/ToolShell';
import CronBuilderTool from '@/components/tools/CronBuilderTool';

export default function Page() {
  return (
    <ToolShell id="cron-builder" label="Cron Builder" description="Build cron expressions visually. See human-readable descriptions and next 5 run dates." icon="CRON">
      <CronBuilderTool />
    </ToolShell>
  );
}
