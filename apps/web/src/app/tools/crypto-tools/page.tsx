'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="crypto-tools"
      label="Crypto / Web3 Utils"
      description="QR codes, wallet validators, ENS lookup, and hex converters."
      icon="₿"
    />
  );
}
