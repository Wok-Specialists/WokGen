'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="tilemap"
      label="Tilemap Generator"
      description="Upload a tileset, paint tiles, export Tiled-compatible JSON."
      icon="🗺️"
    />
  );
}
