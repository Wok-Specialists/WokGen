'use client';
import ToolShell from '@/components/tools/ToolShell';
import HashTool from '@/components/tools/HashTool';
export default function Page() {
  return (
    <ToolShell id="hash" label="Hash Generator" description="Generate MD5, SHA-1, SHA-256, SHA-512 for text or files. File checksum verifier." icon="#">
      <HashTool />
    </ToolShell>
  );
}
