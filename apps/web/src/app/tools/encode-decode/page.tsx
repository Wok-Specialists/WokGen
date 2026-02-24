'use client';
import ToolShell from '@/components/tools/ToolShell';
import EncodeTool from '@/components/tools/EncodeTool';
export default function Page() {
  return (
    <ToolShell id="encode-decode" label="Encode / Decode" description="Base64, URL encoding, HTML entities, Unicode escape, JWT decoder, Morse code." icon="🔐">
      <EncodeTool />
    </ToolShell>
  );
}
