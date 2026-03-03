import type { Metadata } from 'next';
import Link from 'next/link';
import PixelEditorTool from '@/components/pixel-editor/PixelEditorTool';

export const metadata: Metadata = {
  title: 'Pixel Editor — WokGen',
  description:
    'Browser-based pixel art editor. Grid canvas with pencil, fill, eraser, eyedropper, and palette. ' +
    'Export as PNG. No install required.',
  openGraph: {
    title: 'Pixel Editor — WokGen',
    description: 'Draw pixel art in the browser. Export PNG. Free, no account needed.',
  },
};

export default function PixelEditorPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-title-row">
            <h1 className="page-title">Pixel Editor</h1>
            <Link href="/pixel/studio" className="btn-ghost btn-sm">
              AI Generator →
            </Link>
          </div>
          <p className="page-subtitle">
            Draw pixel art in the browser — pencil, fill, eraser, eyedropper, and custom palette.
            Export as PNG at native resolution.
          </p>
        </div>
      </div>
      <div className="page-content">
        <PixelEditorTool />
      </div>
    </div>
  );
}
