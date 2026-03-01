'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ── Color math helpers ────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const s1 = s / 100, l1 = l / 100;
  const a = s1 * Math.min(l1, 1 - l1);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l1 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hex = hslToHex(h, s, l);
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function generatePalette(baseHex: string, harmony: string, size: number): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const baseHues: number[] = [];

  switch (harmony) {
    case 'complementary':
      baseHues.push(h, (h + 180) % 360);
      break;
    case 'triadic':
      baseHues.push(h, (h + 120) % 360, (h + 240) % 360);
      break;
    case 'tetradic':
      baseHues.push(h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360);
      break;
    case 'analogous':
      baseHues.push((h - 30 + 360) % 360, h, (h + 30) % 360, (h + 60) % 360);
      break;
    case 'split-complementary':
      baseHues.push(h, (h + 150) % 360, (h + 210) % 360);
      break;
    case 'monochromatic':
    default:
      for (let i = 0; i < size; i++) baseHues.push(h);
      break;
  }

  const colors: string[] = [];
  const steps = size;
  for (let i = 0; i < steps; i++) {
    const hueIdx = i % baseHues.length;
    const hue = baseHues[hueIdx];
    if (harmony === 'monochromatic') {
      const lightness = clamp(20 + (i / (steps - 1)) * 70);
      colors.push(hslToHex(hue, s, lightness));
    } else {
      const variation = Math.floor(i / baseHues.length);
      const lightnessShift = variation * 15 - 7;
      const satShift = variation * 10 - 5;
      colors.push(hslToHex(hue, clamp(s + satShift), clamp(l + lightnessShift)));
    }
  }
  return colors.slice(0, size);
}

// ── Harmony options ────────────────────────────────────────────────────────────

const HARMONY_OPTIONS = [
  'Complementary', 'Triadic', 'Tetradic', 'Analogous', 'Monochromatic', 'Split-complementary',
];

// ── Swatch card ────────────────────────────────────────────────────────────────

function SwatchCard({ color, index }: { color: string; index: number }) {
  const [h, s, l] = hexToHsl(color);
  const [r, g, b] = hslToRgb(h, s, l);
  const textColor = l > 55 ? '#000' : '#fff';

  const copyHex = () => {
    navigator.clipboard.writeText(color).then(() => toast.success(`Copied ${color}`)).catch(() => {});
  };

  return (
    <div className="palette-swatch" style={{ background: color }}>
      <div className="palette-swatch__color" style={{ background: color }} />
      <div className="palette-swatch__info" style={{ color: textColor }}>
        <button
          type="button"
          className="palette-swatch__hex"
          onClick={copyHex}
          style={{ color: textColor, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700, fontSize: 13 }}
          title="Click to copy hex"
        >
          {color.toUpperCase()}
        </button>
        <span style={{ fontSize: 11, opacity: 0.75 }}>rgb({r},{g},{b})</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>--color-{index + 1}</span>
      </div>
    </div>
  );
}

// ── Mock UI preview ────────────────────────────────────────────────────────────

function PalettePreview({ palette }: { palette: string[] }) {
  if (palette.length < 3) return null;
  const [bg, surface, accent, text] = [palette[0], palette[1], palette[palette.length - 1], palette[Math.floor(palette.length / 2)]];
  return (
    <div className="tool-page__card" style={{ background: bg, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', background: surface, borderBottom: `1px solid ${accent}22` }}>
        <span style={{ color: text, fontWeight: 600, fontSize: 14 }}>Preview Card</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{ color: text, fontSize: 13, marginBottom: 12 }}>Your palette applied to a sample UI component.</p>
        <button
          type="button"
          style={{ background: accent, color: bg, border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Action Button
        </button>
      </div>
    </div>
  );
}

// ── Main client ────────────────────────────────────────────────────────────────

export function PaletteClient() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [harmony, setHarmony] = useState('Complementary');
  const [size, setSize] = useState(6);
  const [palette, setPalette] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(() => {
    const colors = generatePalette(baseColor, harmony.toLowerCase().replace(/ /g, '-'), size);
    setPalette(colors);
    setGenerated(true);
  }, [baseColor, harmony, size]);

  useEffect(() => {
    if (generated) generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseColor, harmony, size]);

  const exportCSS = () => {
    const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(() => toast.success('CSS variables copied!')).catch(() => {});
  };

  const exportJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(palette, null, 2)).then(() => toast.success('JSON copied!')).catch(() => {});
  };

  const exportTailwind = () => {
    const obj = Object.fromEntries(palette.map((c, i) => [`color-${i + 1}`, c]));
    const tw = `colors: ${JSON.stringify(obj, null, 2)}`;
    navigator.clipboard.writeText(tw).then(() => toast.success('Tailwind config copied!')).catch(() => {});
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setBaseColor(val);
  };

  return (
    <div className="tool-palette">
      <div className="tool-page__inner">
        <div className="tool-page__header">
          <h1 className="tool-page__title">Color Palette Generator</h1>
          <p className="tool-page__subtitle">Generate harmonious color palettes from a base color</p>
        </div>

        <div className="tool-page__card palette-controls">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="tool-page__label">Base Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => { setBaseColor(e.target.value); setHexInput(e.target.value); }}
                  style={{ width: 44, height: 36, cursor: 'pointer', border: 'none', borderRadius: 6, background: 'none' }}
                  aria-label="Pick base color"
                />
                <input
                  className="input"
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInput(e.target.value)}
                  placeholder="#3b82f6"
                  style={{ width: 100 }}
                  maxLength={7}
                />
              </div>
            </div>

            <div>
              <label className="tool-page__label">Harmony</label>
              <select
                className="input"
                value={harmony}
                onChange={(e) => setHarmony(e.target.value)}
                style={{ minWidth: 180 }}
              >
                {HARMONY_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="tool-page__label">Size: <strong>{size}</strong></label>
              <input
                type="range"
                min={4}
                max={12}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="tool-music__slider"
                style={{ margin: 0, marginTop: 8 }}
              />
            </div>

            <button
              type="button"
              className="tool-page__btn-primary"
              onClick={generate}
              style={{ alignSelf: 'flex-end' }}
            >
              Generate
            </button>
          </div>
        </div>

        {palette.length > 0 && (
          <>
            <div className="palette-swatches">
              {palette.map((color, i) => <SwatchCard key={i} color={color} index={i} />)}
            </div>

            <PalettePreview palette={palette} />

            <div className="palette-export">
              <button type="button" className="tool-page__btn-primary" onClick={exportCSS}>
                Export CSS Variables
              </button>
              <button type="button" className="tool-page__btn-primary" onClick={exportJSON} style={{ background: 'var(--surface-raised)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                Export JSON
              </button>
              <button type="button" className="tool-page__btn-primary" onClick={exportTailwind} style={{ background: 'var(--surface-raised)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                Export Tailwind
              </button>
            </div>
          </>
        )}

        {!generated && (
          <div className="tool-page__card" style={{ textAlign: 'center', padding: '40px 24px', marginTop: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
            <p style={{ color: 'var(--text-faint)' }}>Pick a color and click Generate to create your palette</p>
          </div>
        )}
      </div>
    </div>
  );
}
