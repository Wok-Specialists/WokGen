'use client';

import ToolShell from '@/components/tools/ToolShell';
import BackgroundRemoverTool from '@/components/tools/BackgroundRemoverTool';

export default function Page() {
  return (
    <ToolShell
      id="background-remover"
      label="Background Remover"
      description="Remove backgrounds from images instantly. 100% browser-side — no upload, completely private."
      icon="✂️"
    >
      <BackgroundRemoverTool />
    </ToolShell>
  );
}
