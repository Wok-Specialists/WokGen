import type { Metadata } from 'next';
import Link from 'next/link';
import AtlasPacker from './_client';

export const metadata: Metadata = {
  title: 'Sprite Atlas Packer — WokGen',
  description:
    'Pack multiple sprite PNG files into a single texture atlas. ' +
    'Configurable padding, three pack modes (rows, grid, strip), power-of-2 size option. ' +
    'Export atlas PNG + JSON manifest (TexturePacker-compatible).',
  openGraph: {
    title: 'Sprite Atlas Packer — WokGen',
    description: 'Pack sprites into a texture atlas. Export PNG + JSON manifest. Free.',
  },
};

export default function AtlasPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-title-row">
            <h1 className="page-title">Sprite Atlas Packer</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/editor" className="btn-ghost btn-sm">Pixel Editor</Link>
              <Link href="/pixel/studio" className="btn-ghost btn-sm">AI Generator →</Link>
            </div>
          </div>
          <p className="page-subtitle">
            Upload multiple PNG sprites and pack them into a single texture atlas.
            Three pack modes, configurable padding, power-of-2 sizes.
            Export the atlas PNG + a JSON manifest compatible with TexturePacker and Phaser.
          </p>
        </div>
      </div>
      <div className="page-content">
        <AtlasPacker />
      </div>
    </div>
  );
}
