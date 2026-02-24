'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="mockup"
      label="Mockup Generator"
      description="Drop your screenshot into MacBook, iPhone, iPad, or browser frames."
      icon="🖥️"
    />
  );
}
