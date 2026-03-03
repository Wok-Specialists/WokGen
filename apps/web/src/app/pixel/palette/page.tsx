import type { Metadata } from 'next';
import Link from 'next/link';
import PaletteStudio from './_client';

export const metadata: Metadata = {
  title: 'Palette Studio — WokGen',
  description:
    'Browse curated pixel art palettes (PICO-8, NES, Game Boy, Endesga 32, Sweetie 16), ' +
    'create custom palettes, or extract colors from any image. Export as CSS, JSON, or hex.',
  openGraph: {
    title: 'Palette Studio — WokGen',
    description: 'Curated pixel art palettes + color extraction. Export CSS / JSON / hex.',
  },
};

export default function PalettePage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-title-row">
            <h1 className="page-title">Palette Studio</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/editor" className="btn-ghost btn-sm">Pixel Editor</Link>
              <Link href="/pixel/studio" className="btn-ghost btn-sm">AI Generator →</Link>
            </div>
          </div>
          <p className="page-subtitle">
            Browse 10+ curated palettes (PICO-8, NES, Game Boy, Endesga 32…), build your own,
            or extract colors from any image. Export as CSS variables, JSON, or hex list.
          </p>
        </div>
      </div>
      <div className="page-content">
        <PaletteStudio />
      </div>
    </div>
  );
}
