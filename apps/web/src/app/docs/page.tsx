'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Search index — all searchable doc entries
// ---------------------------------------------------------------------------

const SEARCH_INDEX = [
  { title: 'Getting Started', path: '/docs/getting-started', desc: 'New to WokGen? Start here.' },
  { title: 'Pixel — Overview', path: '/docs/pixel#overview', desc: 'What WokGen Pixel is and who it\'s for.' },
  { title: 'Pixel — Style Presets', path: '/docs/pixel#presets', desc: 'All 18 style presets and when to use them.' },
  { title: 'Pixel — Prompting Guide', path: '/docs/pixel#prompting', desc: 'How to write great pixel art prompts.' },
  { title: 'Pixel — Negative Prompts', path: '/docs/pixel#negative', desc: 'Exclude unwanted elements from generations.' },
  { title: 'Pixel — Size Guide', path: '/docs/pixel#sizes', desc: 'Recommended canvas sizes by use case.' },
  { title: 'Pixel — Export', path: '/docs/pixel#export', desc: 'PNG, GIF, WebP, and spritesheet export.' },
  { title: 'Pixel — Batch Generation', path: '/docs/pixel#batch', desc: 'Generate multiple assets in one shot.' },
  { title: 'Pixel — API Examples', path: '/docs/pixel#api', desc: 'curl and JavaScript API usage for Pixel.' },
  { title: 'Eral — What is Eral?', path: '/docs/eral#overview', desc: 'The AI director concept explained.' },
  { title: 'Eral — Director Mode', path: '/docs/eral#director', desc: 'Multi-step automated generation.' },
  { title: 'Eral — Memory System', path: '/docs/eral#memory', desc: 'How Eral remembers project context.' },
  { title: 'Eral — WAP Commands', path: '/docs/eral#wap', desc: 'Slash-prefixed shortcut commands.' },
  { title: 'Eral — Voice Mode', path: '/docs/eral#voice', desc: 'Talk to Eral with your microphone.' },
  { title: 'API Reference', path: '/docs/api', desc: 'Full REST API documentation.' },
  { title: 'Self-Hosting', path: '/docs/self-hosting', desc: 'Run WokGen on your own infrastructure.' },
  { title: 'Business mode', path: '/docs/business', desc: 'Logos, brand kits, and slide visuals.' },
  { title: 'Vector mode', path: '/docs/vector', desc: 'SVG icons and illustration libraries.' },
  { title: 'UI/UX mode', path: '/docs/uiux', desc: 'React components and design-to-code.' },
  { title: 'Voice mode', path: '/docs/voice', desc: 'AI text-to-speech and narration.' },
  { title: 'Text mode', path: '/docs/text', desc: 'AI copywriting for blogs, emails, and more.' },
  { title: 'Account & Auth', path: '/docs/platform/account', desc: 'GitHub sign-in and profile management.' },
  { title: 'Plans & Billing', path: '/docs/platform/billing', desc: 'Free tier, credits, and subscriptions.' },
  { title: 'Gallery & Projects', path: '/docs/platform/gallery', desc: 'Save, organise, and share assets.' },
];

// ---------------------------------------------------------------------------
// Mode cards
// ---------------------------------------------------------------------------

const MODES = [
  { href: '/docs/pixel',    label: 'Pixel',    dot: '#a78bfa', desc: 'Sprites, animations, tilesets' },
  { href: '/docs/business', label: 'Business', dot: '#60a5fa', desc: 'Logos, brand kits, banners' },
  { href: '/docs/vector',   label: 'Vector',   dot: '#34d399', desc: 'SVG icons, illustrations' },
  { href: '/docs/uiux',     label: 'UI/UX',    dot: '#f472b6', desc: 'React components, design-to-code' },
  { href: '/docs/voice',    label: 'Voice',    dot: '#f59e0b', desc: 'Text-to-speech, NPC dialogue' },
  { href: '/docs/text',     label: 'Text',     dot: '#10b981', desc: 'Copywriting, blogs, emails' },
];

const PLATFORM = [
  { href: '/docs/tools',           icon: 'tools', label: 'Tools Guide',   desc: '35+ browser tools, zero install' },
  { href: '/docs/eral',            icon: 'eral', label: 'Eral',          desc: 'AI director and WAP commands' },
  { href: '/docs/api',             icon: 'api', label: 'API Reference', desc: 'REST endpoints and auth' },
  { href: '/docs/self-hosting',    icon: 'host', label: 'Self-Hosting',  desc: 'Run WokGen locally or on-prem' },
];

const POPULAR = [
  { href: '/docs/getting-started',  title: 'Getting Started',         desc: 'The fastest path to your first generated asset.' },
  { href: '/docs/pixel#prompting',  title: 'Pixel Prompting Guide',    desc: 'Do\'s and don\'ts for high-quality pixel art prompts.' },
  { href: '/docs/eral#director',    title: 'Eral Director Mode',       desc: 'Let the AI plan and run complex multi-step jobs.' },
  { href: '/docs/pixel#api',        title: 'API Quickstart (Pixel)',   desc: 'curl and JavaScript examples to call the Pixel API.' },
  { href: '/docs/platform/billing', title: 'Plans & Free Tier',        desc: 'Understand what\'s free vs credit-based.' },
];

// ---------------------------------------------------------------------------
// Search component
// ---------------------------------------------------------------------------

function DocSearch() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (e) => e.title.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  return (
    <div>
      <div className="docs-hub-search-bar">
        <span className="docs-hub-search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Search documentation…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search documentation"
        />
      </div>
      {results.length > 0 && (
        <div className="docs-hub-search-results" role="listbox">
          {results.map((r) => (
            <Link key={r.path} href={r.path} className="docs-hub-search-result" role="option" onClick={() => setQuery('')}>
              <span className="docs-hub-search-result-title">{r.title}</span>
              <span className="docs-hub-search-result-path">{r.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsHub() {
  return (
    <div className="docs-hub-v2">
      {/* Header */}
      <div className="docs-hub-v2-header">
        <h1 className="docs-hub-v2-title">Documentation</h1>
        <p className="docs-hub-v2-subtitle">
          Everything you need to create, export, and automate AI-generated assets with WokGen.
        </p>
      </div>

      {/* Search */}
      <DocSearch />

      {/* Quick Start */}
      <div className="docs-hub-v2-section">
        <div className="docs-hub-v2-section-label">Get started in 5 minutes</div>
        <div className="docs-hub-quickstart">
          <div className="docs-hub-quickstart-title">Your first generation</div>
          <div className="docs-hub-quicksteps">
            {[
              { n: '1', title: 'Pick a Studio', desc: 'Choose the mode that matches your asset type — Pixel for game art, Business for branding, and so on.' },
              { n: '2', title: 'Describe it', desc: 'Type a short, noun-focused prompt. Add a style preset and size. No special syntax needed.' },
              { n: '3', title: 'Generate & Export', desc: 'Hit Generate. Preview at 4×. Download as PNG, GIF, or WebP — ready for your project.' },
            ].map((s) => (
              <div key={s.n} className="docs-hub-quickstep">
                <div className="docs-hub-quickstep-num">{s.n}</div>
                <div>
                  <div className="docs-hub-quickstep-title">{s.title}</div>
                  <div className="docs-hub-quickstep-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <Link href="/docs/getting-started" className="docs-hub-card-cta">
            Full Getting Started guide →
          </Link>
        </div>
      </div>

      {/* By Mode */}
      <div className="docs-hub-v2-section">
        <div className="docs-hub-v2-section-label">By Mode</div>
        <div className="docs-hub-mode-grid">
          {MODES.map((m) => (
            <Link key={m.href} href={m.href} className="docs-hub-mode-card">
              <div className="docs-hub-mode-card-dot" style={{ background: m.dot }} />
              <div className="docs-hub-mode-card-title">{m.label}</div>
              <div className="docs-hub-mode-card-desc">{m.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div className="docs-hub-v2-section">
        <div className="docs-hub-v2-section-label">Platform Docs</div>
        <div className="docs-hub-platform-grid">
          {PLATFORM.map((p) => (
            <Link key={p.href} href={p.href} className="docs-hub-platform-card">
              <div className="docs-hub-platform-card-icon">{p.icon}</div>
              <div className="docs-hub-platform-card-title">{p.label}</div>
              <div className="docs-hub-platform-card-desc">{p.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular pages */}
      <div className="docs-hub-v2-section">
        <div className="docs-hub-v2-section-label">Popular pages</div>
        <div className="docs-hub-popular-list">
          {POPULAR.map((p) => (
            <Link key={p.href} href={p.href} className="docs-hub-popular-item">
              <div>
                <div className="docs-hub-popular-title">{p.title}</div>
                <div className="docs-hub-popular-desc">{p.desc}</div>
              </div>
              <span className="docs-hub-popular-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
