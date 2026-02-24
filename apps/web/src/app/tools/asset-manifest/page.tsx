'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="asset-manifest"
      label="Asset Manifest Builder"
      description="Generate Phaser/Pixi/Unity-compatible asset manifests."
      icon="JSN"
    />
  );
}
