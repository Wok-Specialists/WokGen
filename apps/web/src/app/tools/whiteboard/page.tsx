'use client';
import ToolShell from '@/components/tools/ToolShell';

export default function Page() {
  return (
    <ToolShell
      id="whiteboard"
      label="Infinite Whiteboard"
      description="Open-source infinite canvas powered by tldraw. Shapes, arrows, sticky notes, freehand drawing. Auto-saves to your browser."
      icon="🖊️"
    >
      <TldrawBoard />
    </ToolShell>
  );
}

function TldrawBoard() {
  return (
    <div className="whiteboard-placeholder">
      <div className="tool-shell-soon">
        <div className="tool-shell-soon-icon">🖊️</div>
        <h2 className="tool-shell-soon-title">Whiteboard Loading</h2>
        <p className="tool-shell-soon-desc">
          The infinite whiteboard uses tldraw (MIT licensed). Install it with:<br/>
          <code>npm install tldraw --prefix apps/web --legacy-peer-deps</code><br/><br/>
          Then this component will load the full tldraw editor with localStorage persistence.
        </p>
      </div>
    </div>
  );
}
