import type { Metadata } from 'next';
import Link from 'next/link';
import PixelEditorTool from '@/components/pixel-editor/PixelEditorTool';

export const metadata: Metadata = {
  title: 'Pixel Editor — WokGen',
  description:
    'Full-featured browser pixel art editor. Draw, fill, erase, line, rectangle, circle. ' +
    'Undo/redo, animation frames, GIF export, PNG spritesheet, palette management. No install.',
  openGraph: {
    title: 'Pixel Editor — WokGen',
    description: 'Draw pixel art in the browser. Animation frames, GIF export, undo/redo. Free.',
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
            Draw pixel art in the browser — pencil, eraser, fill, line, rectangle, circle, eyedropper.
            Undo/redo, mirror mode, animation frames, GIF &amp; PNG export. No install required.
          </p>
        </div>
      </div>
      <div className="page-content">
        <PixelEditorTool />
      </div>
    </div>
  );
}
