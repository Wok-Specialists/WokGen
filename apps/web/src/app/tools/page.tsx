'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export interface ToolDef {
  id: string;
  label: string;
  description: string;
  href: string;
  tags: ToolTag[];
  icon: string;
  status: 'live' | 'beta' | 'soon';
  clientOnly?: boolean; // true = no data leaves browser
}

export type ToolTag =
  | 'image' | 'design' | 'dev' | 'gamedev' | 'pdf'
  | 'text' | 'crypto' | 'audio' | 'collab' | 'misc';

const TAG_LABELS: Record<ToolTag, string> = {
  image:   '🖼 Image',
  design:  '🎨 Design',
  dev:     '💻 Dev',
  gamedev: '🎮 Game Dev',
  pdf:     '📄 PDF',
  text:    '✍️ Text',
  crypto:  '₿ Crypto',
  audio:   '🔊 Audio',
  collab:  '🖊 Collab',
  misc:    '🔧 Misc',
};

export const TOOLS: ToolDef[] = [
  // ── IMAGE ────────────────────────────────────────────────────────────────
  {
    id: 'background-remover',
    label: 'Background Remover',
    description: 'Remove backgrounds from images instantly. Runs entirely in your browser — no upload required.',
    href: '/tools/background-remover',
    tags: ['image'],
    icon: '✂️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'image-converter',
    label: 'Image Converter',
    description: 'Convert between PNG, JPG, WebP, GIF, and AVIF. Batch up to 10 files at once.',
    href: '/tools/image-converter',
    tags: ['image'],
    icon: '🔄',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'image-compress',
    label: 'Image Compressor',
    description: 'Compress images with a quality slider. Live before/after size comparison.',
    href: '/tools/image-compress',
    tags: ['image'],
    icon: '🗜️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'image-resize',
    label: 'Image Resizer',
    description: 'Resize and crop images. Social media presets for every platform. Batch mode.',
    href: '/tools/image-resize',
    tags: ['image'],
    icon: '↔️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'color-palette',
    label: 'Color Palette Extractor',
    description: 'Extract dominant colors from any image. Export as CSS variables, JSON, or Tailwind config.',
    href: '/tools/color-palette',
    tags: ['image', 'design'],
    icon: '🎨',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'social-resize',
    label: 'Social Media Resizer',
    description: 'Upload once, export for every platform: Instagram, Twitter, YouTube, TikTok, LinkedIn, OG.',
    href: '/tools/social-resize',
    tags: ['image'],
    icon: '📱',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'sprite-packer',
    label: 'Sprite Sheet Packer',
    description: 'Pack multiple PNGs into a sprite atlas. Exports PNG + JSON manifest with texture coordinates.',
    href: '/tools/sprite-packer',
    tags: ['image', 'gamedev'],
    icon: '🧩',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'pixel-editor',
    label: 'Pixel Art Editor',
    description: 'Quick browser-based pixel art editor. Grid canvas, pencil, fill, eraser, palette. Export PNG.',
    href: '/tools/pixel-editor',
    tags: ['image', 'gamedev'],
    icon: '🖍️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'favicon',
    label: 'Favicon Generator',
    description: 'Upload any image → favicon.ico (16/32/48/64px), PNG variants, apple-touch-icon. ZIP download.',
    href: '/tools/favicon',
    tags: ['image', 'dev'],
    icon: '⭐',
    status: 'live',
    clientOnly: true,
  },
  // ── DESIGN ───────────────────────────────────────────────────────────────
  {
    id: 'css-generator',
    label: 'CSS Generator Suite',
    description: 'Gradient, glassmorphism, box shadow, border radius, and animation builders with live preview.',
    href: '/tools/css-generator',
    tags: ['design', 'dev'],
    icon: '✨',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'color-tools',
    label: 'Color Utilities',
    description: 'Hex/RGB/HSL/OKLCH converter, WCAG contrast checker, color harmonies, and palette generator.',
    href: '/tools/color-tools',
    tags: ['design', 'dev'],
    icon: '🌈',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'og-preview',
    label: 'Open Graph Preview',
    description: 'Preview how your link appears on Twitter/X, Facebook, LinkedIn, Discord, and Slack.',
    href: '/tools/og-preview',
    tags: ['design', 'dev'],
    icon: '👁️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'mockup',
    label: 'Mockup Generator',
    description: 'Drop your screenshot into device frames: MacBook, iPhone, iPad, Android, Browser window.',
    href: '/tools/mockup',
    tags: ['design'],
    icon: '🖥️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'font-pairer',
    label: 'Font Pairer',
    description: 'Browse Google Fonts, pick heading + body pairs. Live preview with your own text.',
    href: '/tools/font-pairer',
    tags: ['design'],
    icon: '🔤',
    status: 'live',
    clientOnly: true,
  },
  // ── DEV ──────────────────────────────────────────────────────────────────
  {
    id: 'json-tools',
    label: 'JSON Toolkit',
    description: 'Format, validate, minify, diff, and convert JSON. JSON path queries. All client-side.',
    href: '/tools/json-tools',
    tags: ['dev'],
    icon: '{ }',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'regex',
    label: 'Regex Tester',
    description: 'Live match highlighting, group captures, pattern explanation, and a library of common patterns.',
    href: '/tools/regex',
    tags: ['dev'],
    icon: '🔍',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'encode-decode',
    label: 'Encode / Decode',
    description: 'Base64, URL encoding, HTML entities, Unicode escape, JWT decoder, Morse code, ROT13.',
    href: '/tools/encode-decode',
    tags: ['dev'],
    icon: '🔐',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'hash',
    label: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512, SHA-3 for text or files. File checksum verifier.',
    href: '/tools/hash',
    tags: ['dev'],
    icon: '#',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'generators',
    label: 'Developer Generators',
    description: 'UUID v4/v7, password generator with entropy meter, Lorem ipsum, CRON builder, timestamp converter, text diff.',
    href: '/tools/generators',
    tags: ['dev'],
    icon: '⚡',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'markdown',
    label: 'Markdown Editor',
    description: 'Split-pane editor with live preview, GFM support, table of contents, and export to HTML.',
    href: '/tools/markdown',
    tags: ['dev', 'text'],
    icon: '📝',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'csv-tools',
    label: 'CSV / Data Tools',
    description: 'Convert CSV ↔ JSON ↔ YAML. Table viewer with sort and filter. Column statistics.',
    href: '/tools/csv-tools',
    tags: ['dev'],
    icon: '📊',
    status: 'live',
    clientOnly: true,
  },
  // ── GAME DEV ─────────────────────────────────────────────────────────────
  {
    id: 'tilemap',
    label: 'Tilemap Generator',
    description: 'Upload a tileset, paint tiles on a grid, export Tiled-compatible JSON. Game dev essential.',
    href: '/tools/tilemap',
    tags: ['gamedev'],
    icon: '🗺️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'asset-manifest',
    label: 'Asset Manifest Builder',
    description: 'Drop a folder of assets, get a Phaser/Pixi/Unity-compatible manifest JSON instantly.',
    href: '/tools/asset-manifest',
    tags: ['gamedev', 'dev'],
    icon: '📋',
    status: 'live',
    clientOnly: true,
  },
  // ── PDF ──────────────────────────────────────────────────────────────────
  {
    id: 'pdf',
    label: 'PDF Toolkit',
    description: 'Merge PDFs, extract pages, convert to images, add watermarks, compress. All browser-side.',
    href: '/tools/pdf',
    tags: ['pdf'],
    icon: '📄',
    status: 'live',
    clientOnly: true,
  },
  // ── TEXT ─────────────────────────────────────────────────────────────────
  {
    id: 'text-tools',
    label: 'Text Utilities',
    description: 'Word counter, 7 case formats, slug generator, sort/dedup lines, extract URLs and emails.',
    href: '/tools/text-tools',
    tags: ['text'],
    icon: '✍️',
    status: 'live',
    clientOnly: true,
  },
  // ── CRYPTO ───────────────────────────────────────────────────────────────
  {
    id: 'crypto-tools',
    label: 'Crypto / Web3 Utils',
    description: 'QR code generator, wallet address validator (BTC/ETH/SOL), ENS lookup, hex/dec/bin converter.',
    href: '/tools/crypto-tools',
    tags: ['crypto'],
    icon: '₿',
    status: 'live',
    clientOnly: true,
  },
  // ── AUDIO ────────────────────────────────────────────────────────────────
  {
    id: 'audio-tools',
    label: 'Audio Utilities',
    description: 'Visualize audio waveforms, view file metadata, and create animated GIFs from image sequences.',
    href: '/tools/audio-tools',
    tags: ['audio'],
    icon: '🔊',
    status: 'live',
    clientOnly: true,
  },
  // ── COLLAB ───────────────────────────────────────────────────────────────
  {
    id: 'whiteboard',
    label: 'Infinite Whiteboard',
    description: 'Open-source infinite canvas (tldraw). Shapes, arrows, sticky notes, freehand. Auto-saves locally.',
    href: '/tools/whiteboard',
    tags: ['collab'],
    icon: '🖊️',
    status: 'live',
    clientOnly: true,
  },
  {
    id: 'snippets',
    label: 'Code Snippet Manager',
    description: 'Save, tag, and search code snippets. Syntax highlighting for 50+ languages. Public or private.',
    href: '/tools/snippets',
    tags: ['dev', 'collab'],
    icon: '📌',
    status: 'live',
    clientOnly: false,
  },
];

const ALL_TAGS: ToolTag[] = ['image', 'design', 'dev', 'gamedev', 'pdf', 'text', 'crypto', 'audio', 'collab'];

// ---------------------------------------------------------------------------
// Client component
// ---------------------------------------------------------------------------

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<ToolTag | null>(null);

  const filtered = useMemo(() => {
    let list = TOOLS;
    if (activeTag) list = list.filter(t => t.tags.includes(activeTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      );
    }
    return list;
  }, [search, activeTag]);

  const liveTags = ALL_TAGS.filter(tag =>
    TOOLS.some(t => t.tags.includes(tag))
  );

  return (
    <main className="tools-hub-page">
      {/* Hero */}
      <section className="tools-hub-hero">
        <div className="tools-hub-hero-inner">
          <div className="tools-hub-badge">Free · Browser-native · Private</div>
          <h1 className="tools-hub-title">Creator Tools</h1>
          <p className="tools-hub-subtitle">
            {TOOLS.length} free tools for creators, developers, and game devs.
            <br />Most run entirely in your browser — no upload, no account needed.
          </p>

          {/* Search */}
          <div className="tools-hub-search-wrap">
            <input
              className="tools-hub-search"
              type="search"
              placeholder="Search tools…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Tag filter */}
          <div className="tools-hub-tags">
            <button
              className={`tools-tag-chip${activeTag === null ? ' active' : ''}`}
              onClick={() => setActiveTag(null)}
            >
              All ({TOOLS.length})
            </button>
            {liveTags.map(tag => (
              <button
                key={tag}
                className={`tools-tag-chip${activeTag === tag ? ' active' : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {TAG_LABELS[tag]} ({TOOLS.filter(t => t.tags.includes(tag)).length})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="tools-hub-grid-section">
        <div className="tools-hub-grid">
          {filtered.length === 0 ? (
            <div className="tools-hub-empty">
              <p>No tools match &ldquo;{search}&rdquo;</p>
              <button className="btn-ghost" onClick={() => { setSearch(''); setActiveTag(null); }}>
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map(tool => (
              <Link key={tool.id} href={tool.href} className="tool-card">
                <div className="tool-card-icon" aria-hidden="true">{tool.icon}</div>
                <div className="tool-card-body">
                  <div className="tool-card-header">
                    <span className="tool-card-label">{tool.label}</span>
                    {tool.status === 'beta' && <span className="tool-card-badge beta">Beta</span>}
                    {tool.status === 'soon' && <span className="tool-card-badge soon">Soon</span>}
                    {tool.clientOnly && (
                      <span className="tool-card-badge private" title="Runs in your browser — no data uploaded">
                        🔒 Private
                      </span>
                    )}
                  </div>
                  <p className="tool-card-desc">{tool.description}</p>
                  <div className="tool-card-tags">
                    {tool.tags.map(tag => (
                      <span key={tag} className="tool-tag">{TAG_LABELS[tag]}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="tools-hub-footer-cta">
        <p className="tools-hub-footer-text">
          All tools are free forever.{' '}
          <Link href="/support" className="tools-hub-footer-link">Support the project →</Link>
        </p>
        <p className="tools-hub-footer-sub">
          Missing a tool?{' '}
          <a href="https://github.com/WokSpec/WokGen/issues" target="_blank" rel="noopener noreferrer" className="tools-hub-footer-link">
            Request it on GitHub
          </a>
        </p>
      </section>
    </main>
  );
}
