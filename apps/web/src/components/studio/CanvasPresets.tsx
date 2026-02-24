'use client';

import { useState } from 'react';

type PixelSize = 32 | 64 | 128 | 256 | 512;

interface CanvasPreset {
  label: string;
  size: PixelSize;
}

const CANVAS_PRESETS: CanvasPreset[] = [
  { label: '16×16 Icon',       size: 32  },
  { label: '32×32 Sprite',     size: 32  },
  { label: '48×48 Char',       size: 64  },
  { label: '64×64 Hero',       size: 64  },
  { label: '128×128 Boss',     size: 128 },
  { label: '256×256 Scene',    size: 256 },
  { label: 'Tileset 8px',      size: 256 },
  { label: 'Tileset 16px',     size: 512 },
  { label: 'Spritesheet 4-fr', size: 512 },
];

interface Props {
  currentSize: number;
  onSelect: (size: PixelSize) => void;
}

export function CanvasPresets({ currentSize, onSelect }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="pixel-studio-accordion">
      <button
        type="button"
        className="pixel-studio-accordion__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Canvas Presets</span>
        <span className="pixel-studio-accordion__arrow">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="pixel-studio-canvas-presets">
          {CANVAS_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="pixel-studio-canvas-btn"
              style={{
                background: currentSize === p.size ? 'var(--accent-dim)' : 'var(--surface-overlay)',
                border: `1px solid ${currentSize === p.size ? 'var(--accent-muted)' : 'var(--surface-border)'}`,
                color: currentSize === p.size ? 'var(--accent)' : 'var(--text-muted)',
              }}
              onClick={() => onSelect(p.size)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
