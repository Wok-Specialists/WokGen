'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface Sprite {
  id: string;
  name: string;
  file: File;
  imageData: ImageData;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

interface PackedAtlas {
  width: number;
  height: number;
  sprites: Array<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  dataUrl: string;
}

type PackMode = 'rows' | 'grid' | 'strip';

// ---------------------------------------------------------------------------
// Packing algorithm — simple row-packing
// ---------------------------------------------------------------------------
function packSprites(
  sprites: Sprite[],
  padding: number,
  mode: PackMode,
  forcePow2: boolean
): PackedAtlas {
  if (sprites.length === 0) {
    return { width: 0, height: 0, sprites: [], dataUrl: '' };
  }

  let positions: { x: number; y: number; w: number; h: number }[] = [];
  let atlasW = 0, atlasH = 0;

  if (mode === 'strip') {
    // Horizontal strip
    let x = padding;
    const maxH = Math.max(...sprites.map(s => s.height));
    atlasH = maxH + padding * 2;
    sprites.forEach(s => {
      positions.push({ x, y: padding, w: s.width, h: s.height });
      x += s.width + padding;
    });
    atlasW = x;
  } else if (mode === 'grid') {
    // Square-ish grid
    const cols = Math.ceil(Math.sqrt(sprites.length));
    const cellW = Math.max(...sprites.map(s => s.width)) + padding;
    const cellH = Math.max(...sprites.map(s => s.height)) + padding;
    sprites.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.push({ x: padding + col*cellW, y: padding + row*cellH, w: s.width, h: s.height });
    });
    const rows = Math.ceil(sprites.length / cols);
    atlasW = padding + cols * cellW;
    atlasH = padding + rows * cellH;
  } else {
    // Row-packing (best-fit decreasing height)
    const sorted = [...sprites].map((s, i) => ({ ...s, origIdx: i }))
      .sort((a, b) => b.height - a.height);
    const MAX_W = 2048;
    let rowX = padding, rowY = padding, rowH = 0;
    const posByOrigIdx: Record<number, { x: number; y: number; w: number; h: number }> = {};
    let maxX = 0;

    for (const s of sorted) {
      if (rowX + s.width + padding > MAX_W && rowX > padding) {
        rowY += rowH + padding;
        rowX = padding;
        rowH = 0;
      }
      posByOrigIdx[s.origIdx] = { x: rowX, y: rowY, w: s.width, h: s.height };
      rowX += s.width + padding;
      if (rowX > maxX) maxX = rowX;
      if (s.height > rowH) rowH = s.height;
    }

    atlasW = maxX;
    atlasH = rowY + rowH + padding;
    positions = sprites.map((_, i) => posByOrigIdx[i]);
  }

  if (forcePow2) {
    atlasW = nextPow2(atlasW);
    atlasH = nextPow2(atlasH);
  }

  // Render to canvas
  const canvas = document.createElement('canvas');
  canvas.width = atlasW; canvas.height = atlasH;
  const ctx = canvas.getContext('2d')!;

  sprites.forEach((s, i) => {
    const p = positions[i];
    // Draw the sprite's ImageData
    const tmp = document.createElement('canvas');
    tmp.width = s.width; tmp.height = s.height;
    tmp.getContext('2d')!.putImageData(s.imageData, 0, 0);
    ctx.drawImage(tmp, p.x, p.y);
  });

  return {
    width: atlasW,
    height: atlasH,
    dataUrl: canvas.toDataURL('image/png'),
    sprites: sprites.map((s, i) => ({
      name: s.name,
      x: positions[i].x,
      y: positions[i].y,
      width: s.width,
      height: s.height,
    })),
  };
}

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AtlasPacker() {
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [padding, setPadding] = useState(2);
  const [packMode, setPackMode] = useState<PackMode>('rows');
  const [forcePow2, setForcePow2] = useState(false);
  const [exportScale, setExportScale] = useState(1);
  const [packed, setPacked] = useState<PackedAtlas | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const dropRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load image file → Sprite
  const loadFile = useCallback((file: File): Promise<Sprite> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        URL.revokeObjectURL(url);
        resolve({
          id: Math.random().toString(36).slice(2, 8),
          name: file.name.replace(/\.[^.]+$/, ''),
          file,
          imageData,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const loaded = await Promise.all(arr.map(f => loadFile(f)));
    setSprites(prev => {
      const existingNames = new Set(prev.map(s => s.name));
      const newOnes = loaded.filter(s => !existingNames.has(s.name));
      return [...prev, ...newOnes];
    });
    setPacked(null);
  }, [loadFile]);

  const removeSprite = (id: string) => {
    setSprites(prev => prev.filter(s => s.id !== id));
    setPacked(null);
  };

  const pack = () => {
    const result = packSprites(sprites, padding, packMode, forcePow2);
    setPacked(result);
  };

  // Draw packed atlas preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !packed) return;
    const ctx = canvas.getContext('2d')!;
    const img = new window.Image();
    img.onload = () => {
      canvas.width = packed.width;
      canvas.height = packed.height;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw labels
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255,0,128,0.8)';
      for (const s of packed.sprites) {
        ctx.strokeStyle = 'rgba(255,0,128,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x+0.5, s.y+0.5, s.width, s.height);
      }
    };
    img.src = packed.dataUrl;
  }, [packed]);

  const exportAtlas = (scale: number) => {
    if (!packed) return;
    if (scale === 1) {
      const a = document.createElement('a');
      a.download = `atlas-${packed.width}x${packed.height}.png`;
      a.href = packed.dataUrl;
      a.click();
    } else {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = packed.width * scale;
        canvas.height = packed.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement('a');
        a.download = `atlas-${packed.width}x${packed.height}@${scale}x.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      img.src = packed.dataUrl;
    }
  };

  const exportJson = () => {
    if (!packed) return;
    const json = JSON.stringify({
      meta: { width: packed.width, height: packed.height, scale: exportScale },
      frames: Object.fromEntries(packed.sprites.map(s => [
        s.name,
        { frame: { x: s.x, y: s.y, w: s.width, h: s.height },
          rotated: false, trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: s.width, h: s.height },
          sourceSize: { w: s.width, h: s.height },
        }
      ])),
    }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.download = `atlas-${packed.width}x${packed.height}.json`;
    a.href = URL.createObjectURL(blob);
    a.click();
  };

  const getJsonText = () => {
    if (!packed) return '';
    return JSON.stringify({
      meta: { width: packed.width, height: packed.height },
      frames: Object.fromEntries(packed.sprites.map(s => [
        s.name,
        { x: s.x, y: s.y, w: s.width, h: s.height }
      ])),
    }, null, 2);
  };

  return (
    <div className="atlas-root">
      {/* Left panel: sprite list + settings */}
      <div className="atlas-sidebar">
        {/* Upload zone */}
        <div
          className={`pal-dropzone${dragOver ? ' drag-over' : ''}`}
          style={{ minHeight: '80px' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => dropRef.current?.click()}
        >
          <div className="pal-dropzone-inner">
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <p>Drop PNG sprites here or click to upload</p>
            <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>Multiple files supported</p>
          </div>
        </div>
        <input ref={dropRef} type="file" accept="image/*" multiple hidden
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />

        {/* Sprite list */}
        {sprites.length > 0 && (
          <div className="atlas-sprite-list">
            <div className="atlas-list-header">
              <span className="pxe-label">{sprites.length} sprite{sprites.length !== 1 ? 's' : ''}</span>
              <button className="pxe-btn pxe-btn-danger" onClick={() => { setSprites([]); setPacked(null); }}>
                Clear all
              </button>
            </div>
            {sprites.map(s => (
              <div key={s.id} className="atlas-sprite-row">
                <div className="atlas-sprite-thumb" style={{
                  backgroundImage: `url(${URL.createObjectURL(s.file)})`,
                }} />
                <div className="atlas-sprite-info">
                  <span className="atlas-sprite-name">{s.name}</span>
                  <span className="pxe-label">{s.width}×{s.height}</span>
                </div>
                <button className="pxe-btn pxe-btn-danger" onClick={() => removeSprite(s.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="atlas-settings">
          <div className="atlas-setting-row">
            <span className="pxe-label">Padding (px):</span>
            <input
              type="number" min={0} max={32} value={padding}
              className="pxe-hex-input" style={{ width: '4rem' }}
              onChange={e => { setPadding(+e.target.value); setPacked(null); }}
            />
          </div>
          <div className="atlas-setting-row">
            <span className="pxe-label">Pack mode:</span>
            {(['rows','grid','strip'] as PackMode[]).map(m => (
              <button key={m} className={`pxe-size-btn${packMode===m?' active':''}`}
                onClick={() => { setPackMode(m); setPacked(null); }}>{m}</button>
            ))}
          </div>
          <div className="atlas-setting-row">
            <label className="pxe-toggle">
              <input type="checkbox" checked={forcePow2} onChange={e => { setForcePow2(e.target.checked); setPacked(null); }} />
              Power-of-2 size
            </label>
          </div>
        </div>

        <button
          className="pxe-btn pxe-btn-primary"
          style={{ width: '100%' }}
          disabled={sprites.length === 0}
          onClick={pack}
        >
          ⚡ Pack Atlas
        </button>

        {/* Export */}
        {packed && (
          <div className="atlas-export">
            <div className="atlas-setting-row">
              <span className="pxe-label">Export scale:</span>
              {[1,2,4].map(s => (
                <button key={s} className={`pxe-size-btn${exportScale===s?' active':''}`}
                  onClick={() => setExportScale(s)}>{s}×</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button className="pxe-btn pxe-btn-primary" onClick={() => exportAtlas(exportScale)}>
                📥 Export PNG
              </button>
              <button className="pxe-btn pxe-btn-primary" onClick={exportJson}>
                📄 Export JSON
              </button>
            </div>
            <p className="pxe-canvas-info">
              {packed.width}×{packed.height}px · {packed.sprites.length} sprites packed
            </p>
          </div>
        )}
      </div>

      {/* Right panel: atlas preview */}
      <div className="atlas-preview-panel">
        {!packed && (
          <div className="atlas-empty-state">
            <span style={{ fontSize: '3rem' }}>📦</span>
            <p>Upload sprites and click <strong>Pack Atlas</strong></p>
            <p style={{ fontSize: '0.78rem', opacity: 0.6 }}>
              Sprites will be arranged automatically with the selected padding and pack mode.
            </p>
          </div>
        )}
        {packed && packed.width > 0 && (
          <>
            <div className="pxe-canvas-wrap" style={{ overflow: 'auto', maxHeight: '60vh' }}>
              <canvas
                ref={previewCanvasRef}
                className="pxe-canvas"
                style={{ maxWidth: '100%' }}
              />
            </div>

            {/* JSON manifest preview */}
            <div className="atlas-json-section">
              <button
                className="pxe-btn"
                onClick={() => setJsonExpanded(x => !x)}
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>JSON Manifest</span>
                <span>{jsonExpanded ? '▲' : '▼'}</span>
              </button>
              {jsonExpanded && (
                <pre className="pal-export-pre">{getJsonText()}</pre>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
