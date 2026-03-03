'use client';

import { useState, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Built-in curated palettes
// ---------------------------------------------------------------------------
interface BuiltInPalette {
  name: string;
  author?: string;
  source?: string;
  colors: string[];
}

const CURATED: BuiltInPalette[] = [
  {
    name: 'PICO-8',
    author: 'Lexaloffle',
    colors: [
      '#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f',
      '#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436',
      '#29adff','#83769c','#ff77a8','#ffccaa',
    ],
  },
  {
    name: 'NES (2C02)',
    colors: [
      '#626262','#001fb2','#2404c8','#5200b2','#730076','#800024',
      '#730b00','#522800','#244400','#005c00','#006400','#005e20',
      '#00505c','#000000','#000000','#000000',
      '#ababab','#0d57ff','#4b30ff','#8a13ff','#bc08d6','#d21269',
      '#c72e00','#9d5100','#607b00','#209800','#00a300','#009c47',
      '#009496','#000000','#000000','#000000',
      '#ffffff','#53aeff','#9085ff','#d365ff','#ff57ff','#ff5dcf',
      '#ff7757','#fa9e00','#bdcc00','#7ae700','#42f300','#2bef6f',
      '#04d9be','#424242','#000000','#000000',
    ],
  },
  {
    name: 'Game Boy',
    colors: ['#0f380f','#306230','#8bac0f','#9bbc0f'],
  },
  {
    name: 'Game Boy Color (GBC)',
    colors: [
      '#ffffff','#ffad63','#843100','#000000',
      '#63a5ff','#0000ff','#ffffff','#000000',
    ],
  },
  {
    name: 'CGA (Mode 4)',
    colors: ['#000000','#55ffff','#ff55ff','#ffffff'],
  },
  {
    name: 'Endesga 32',
    colors: [
      '#be4a2f','#d77643','#ead4aa','#e4a672','#b86f50','#733e39',
      '#3e2731','#a22633','#e43b44','#f77622','#feae34','#fee761',
      '#63c74d','#3e8948','#265c42','#193c3e','#124e89','#0099db',
      '#2ce8f5','#ffffff','#c0cbdc','#8b9bb4','#5a6988','#3a4466',
      '#262b44','#181425','#ff0044','#68386c','#b55088','#f6757a',
      '#e8b796','#c28569',
    ],
  },
  {
    name: 'Sweetie 16',
    colors: [
      '#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070',
      '#38b764','#257179','#29366f','#3b5dc9','#41a6f6','#73eff7',
      '#f4f4f4','#94b0c2','#566c86','#333c57',
    ],
  },
  {
    name: 'Resurrect 64',
    colors: [
      '#2e222f','#3e3546','#625565','#966c6c','#ab947a','#694f62',
      '#7f708a','#9babb2','#c7dcd0','#ffffff','#6e2727','#b33831',
      '#ea4f36','#f57d4a','#ae2334','#e83b3b','#fb6b1d','#f79617',
      '#f9c22b','#7a3045','#9e4539','#cd683d','#e6904e','#fbb954',
      '#4c3e24','#676633','#a2a947','#d5e04b','#fbff86','#165a4c',
      '#239063','#1ebc73','#91db69','#cddf6c','#313638','#374e4a',
      '#547e64','#92a984','#b2ba90','#0d2030','#0b2e4e','#0d4f8b',
      '#1a7a9b','#29b7d3','#57d4e3','#0d2033','#1d4f66','#0099db',
      '#2ce8f5','#7b4921','#8f6729','#c5a028','#d9c22e','#f3e55d',
      '#eba0aa','#f08090','#cc3c6e','#e82e5e','#3d0c23','#67003d',
      '#a8006f','#cd26a0','#f45dee','#ffa5e0',
    ],
  },
  {
    name: 'Lospec 500',
    colors: [
      '#10121c','#2c1e31','#6b2643','#ac2847','#ec273f','#94493a',
      '#de5d3a','#e98537','#f0c33e','#f7f3b7','#11493d','#1d7748',
      '#1d9863','#28d676','#34e2cf','#4f9ab3','#1b5ed8','#4b31c8',
      '#6b26c8','#9e17cc','#c820c4','#d92666','#e05a4e','#e88b6f',
      '#f0c8a0','#fdf7d0','#a0bbcc','#6b89a0','#416b7d','#2b4966',
    ],
  },
  {
    name: 'Mono (Grayscale)',
    colors: [
      '#000000','#111111','#222222','#333333','#444444','#555555',
      '#666666','#777777','#888888','#999999','#aaaaaa','#bbbbbb',
      '#cccccc','#dddddd','#eeeeee','#ffffff',
    ],
  },
];

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------
function hexToRgb(hex: string): [number,number,number] {
  const n = parseInt(hex.replace('#',''), 16);
  return [(n>>16)&0xff, (n>>8)&0xff, n&0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

function colorDistance(a: string, b: string): number {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
}

function sortByHue(colors: string[]): string[] {
  return [...colors].sort((a, b) => {
    const [r1,g1,b1] = hexToRgb(a);
    const [r2,g2,b2] = hexToRgb(b);
    const hue = ([r,g,bl]: number[]) => {
      const max = Math.max(r,g,bl), min = Math.min(r,g,bl);
      if (max===min) return 0;
      const d = max-min;
      if (max===r) return ((g-bl)/d+6)%6;
      if (max===g) return (bl-r)/d+2;
      return (r-g)/d+4;
    };
    return hue([r1,g1,b1]) - hue([r2,g2,b2]);
  });
}

function sortByLuminance(colors: string[]): string[] {
  const lum = (hex: string) => {
    const [r,g,b] = hexToRgb(hex);
    return 0.299*r + 0.587*g + 0.114*b;
  };
  return [...colors].sort((a,b) => lum(b) - lum(a));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface UserPalette {
  id: string;
  name: string;
  colors: string[];
}

type SortMode = 'original' | 'hue' | 'luminance';
type ExportFormat = 'css' | 'json' | 'txt' | 'hex';

export default function PaletteStudio() {
  const [tab, setTab] = useState<'browse' | 'create' | 'extract'>('browse');
  const [selectedBuiltIn, setSelectedBuiltIn] = useState<BuiltInPalette | null>(null);
  const [userPalettes, setUserPalettes] = useState<UserPalette[]>([]);
  const [activePalette, setActivePalette] = useState<string[] | null>(null);
  const [activeName, setActiveName] = useState('');

  // Create tab
  const [createColors, setCreateColors] = useState<string[]>(['#000000','#ffffff']);
  const [newColor, setNewColor] = useState('#ff0000');
  const [createName, setCreateName] = useState('My Palette');

  // Extract tab
  const [extractColors, setExtractColors] = useState<string[]>([]);
  const [extractCount, setExtractCount] = useState(16);
  const [dragOver, setDragOver] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  // Sort & export
  const [sortMode, setSortMode] = useState<SortMode>('original');
  const [exportFmt, setExportFmt] = useState<ExportFormat>('css');
  const [copied, setCopied] = useState(false);

  const displayColors = useCallback((colors: string[]) => {
    if (sortMode === 'hue') return sortByHue(colors);
    if (sortMode === 'luminance') return sortByLuminance(colors);
    return colors;
  }, [sortMode]);

  const openPalette = (colors: string[], name: string) => {
    setActivePalette(colors);
    setActiveName(name);
  };

  // Extract colors from image via canvas
  const extractFromImage = (file: File) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 256;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Count color occurrences
      const colorMap = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i+3] < 128) continue; // skip transparent
        const hex = rgbToHex(data[i], data[i+1], data[i+2]);
        colorMap.set(hex, (colorMap.get(hex) ?? 0) + 1);
      }

      // Sort by frequency and deduplicate similar colors
      const sorted = [...colorMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([c]) => c);

      // Deduplicate by removing colors too close to already-selected ones
      const result: string[] = [];
      for (const c of sorted) {
        if (result.length >= extractCount) break;
        const tooClose = result.some(r => colorDistance(c, r) < 20);
        if (!tooClose) result.push(c);
      }

      setExtractColors(result);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Export palette
  const getExportText = (colors: string[]): string => {
    const name = activeName || 'palette';
    if (exportFmt === 'css') {
      return `:root {\n${colors.map((c, i) => `  --color-${i+1}: ${c};`).join('\n')}\n}`;
    }
    if (exportFmt === 'json') {
      return JSON.stringify({ name, colors }, null, 2);
    }
    if (exportFmt === 'hex') {
      return colors.map(c => c.replace('#','')).join('\n');
    }
    return colors.join('\n');
  };

  const copyToClipboard = async (colors: string[]) => {
    await navigator.clipboard.writeText(getExportText(colors));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveUserPalette = (name: string, colors: string[]) => {
    const id = Math.random().toString(36).slice(2, 8);
    setUserPalettes(prev => [...prev, { id, name, colors }]);
  };

  return (
    <div className="pal-root">
      {/* Tabs */}
      <div className="pal-tabs">
        {(['browse','create','extract'] as const).map(t => (
          <button key={t} className={`pal-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t === 'browse' ? '🎨 Browse' : t === 'create' ? '✏️ Create' : '🖼 Extract'}
          </button>
        ))}
      </div>

      {/* ---- BROWSE ---- */}
      {tab === 'browse' && (
        <div className="pal-browse">
          <div className="pal-grid">
            {[...CURATED, ...userPalettes.map(p => ({ ...p, author: 'You' }))].map((p) => (
              <div
                key={p.name}
                className={`pal-card${activeName===p.name?' active':''}`}
                onClick={() => openPalette(p.colors, p.name)}
              >
                <div className="pal-card-swatches">
                  {p.colors.slice(0, 16).map((c, i) => (
                    <div key={i} className="pal-card-swatch" style={{ background: c }} />
                  ))}
                </div>
                <div className="pal-card-meta">
                  <span className="pal-card-name">{p.name}</span>
                  <span className="pal-card-count">{p.colors.length} colors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- CREATE ---- */}
      {tab === 'create' && (
        <div className="pal-create">
          <div className="pal-create-row">
            <input
              className="pal-name-input"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              placeholder="Palette name…"
            />
            <input
              type="color"
              className="pxe-color-native"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              style={{width:'2.5rem',height:'2.5rem'}}
            />
            <input
              className="pxe-hex-input"
              value={newColor}
              maxLength={7}
              onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setNewColor(e.target.value); }}
            />
            <button className="pxe-btn pxe-btn-primary" onClick={() => {
              if (!createColors.includes(newColor)) setCreateColors(p => [...p, newColor]);
            }}>+ Add</button>
          </div>

          <div className="pal-create-swatches">
            {createColors.map((c, i) => (
              <div key={i} className="pal-create-swatch-wrap">
                <div
                  className="pal-create-swatch"
                  style={{ background: c }}
                  onClick={() => setNewColor(c)}
                  title={`${c} — click to select`}
                />
                <button
                  className="pal-remove-btn"
                  onClick={() => setCreateColors(p => p.filter((_,j) => j!==i))}
                  title="Remove"
                >✕</button>
              </div>
            ))}
          </div>

          <div className="pal-create-actions">
            <button className="pxe-btn pxe-btn-primary" onClick={() => {
              if (createColors.length < 2) return alert('Add at least 2 colors.');
              saveUserPalette(createName || 'My Palette', createColors);
              openPalette(createColors, createName || 'My Palette');
              setTab('browse');
            }}>💾 Save Palette</button>
            <button className="pxe-btn" onClick={() => openPalette(createColors, createName || 'Custom')}>
              Preview →
            </button>
          </div>
        </div>
      )}

      {/* ---- EXTRACT ---- */}
      {tab === 'extract' && (
        <div className="pal-extract">
          <div className="pal-extract-opts">
            <label className="pxe-label">Colors to extract:</label>
            {[8,16,32].map(n => (
              <button key={n} className={`pxe-size-btn${extractCount===n?' active':''}`}
                onClick={() => setExtractCount(n)}>{n}</button>
            ))}
          </div>

          <div
            className={`pal-dropzone${dragOver?' drag-over':''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f?.type.startsWith('image/')) extractFromImage(f);
            }}
            onClick={() => importRef.current?.click()}
          >
            {extractColors.length === 0 ? (
              <div className="pal-dropzone-inner">
                <span style={{fontSize:'2rem'}}>🖼</span>
                <p>Drop an image here or click to upload</p>
                <p style={{fontSize:'0.75rem',opacity:0.6}}>PNG, JPEG, GIF, WebP supported</p>
              </div>
            ) : (
              <div className="pal-extracted-colors">
                {extractColors.map((c, i) => (
                  <div key={i} className="pal-extracted-swatch" style={{ background: c }} title={c} />
                ))}
              </div>
            )}
          </div>
          <input ref={importRef} type="file" accept="image/*" hidden
            onChange={e => { const f = e.target.files?.[0]; if (f) extractFromImage(f); e.target.value=''; }} />

          {extractColors.length > 0 && (
            <div className="pal-create-actions">
              <button className="pxe-btn pxe-btn-primary" onClick={() => {
                const name = 'Extracted Palette';
                saveUserPalette(name, extractColors);
                openPalette(extractColors, name);
                setTab('browse');
              }}>💾 Save Palette</button>
              <button className="pxe-btn" onClick={() => openPalette(extractColors, 'Extracted')}>
                Preview →
              </button>
              <button className="pxe-btn pxe-btn-danger" onClick={() => setExtractColors([])}>Clear</button>
            </div>
          )}
        </div>
      )}

      {/* ---- Active palette detail ---- */}
      {activePalette && (
        <div className="pal-detail">
          <div className="pal-detail-header">
            <h2 className="pal-detail-title">{activeName}</h2>
            <span className="pxe-label">{activePalette.length} colors</span>
            <div className="pxe-toolgroup" style={{marginLeft:'auto'}}>
              <span className="pxe-label">Sort:</span>
              {(['original','hue','luminance'] as SortMode[]).map(s => (
                <button key={s} className={`pxe-size-btn${sortMode===s?' active':''}`}
                  onClick={() => setSortMode(s)}>{s}</button>
              ))}
            </div>
            <div className="pxe-toolgroup">
              <span className="pxe-label">Export:</span>
              {(['css','json','hex','txt'] as ExportFormat[]).map(f => (
                <button key={f} className={`pxe-size-btn${exportFmt===f?' active':''}`}
                  onClick={() => setExportFmt(f)}>{f}</button>
              ))}
              <button className="pxe-btn pxe-btn-primary" onClick={() => copyToClipboard(activePalette)}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          {/* Swatches big */}
          <div className="pal-detail-swatches">
            {displayColors(activePalette).map((c, i) => (
              <div key={i} className="pal-detail-swatch" title={c}>
                <div className="pal-detail-swatch-color" style={{ background: c }} />
                <span className="pal-detail-swatch-hex">{c}</span>
              </div>
            ))}
          </div>

          {/* Export preview */}
          <pre className="pal-export-pre">{getExportText(activePalette)}</pre>

          <div className="pal-create-actions">
            <a
              className="pxe-btn pxe-btn-primary"
              href={`/editor?palette=${encodeURIComponent(JSON.stringify(activePalette))}`}
            >
              Open in Pixel Editor →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
