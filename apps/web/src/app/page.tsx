import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WokGen — AI Generation Studio',
  description: 'Studio for pixel art, brand assets, vectors, UI components, voice, and code. One workspace, every asset type.',
  keywords: ['AI asset generator', 'pixel art AI', 'brand asset generator', 'sprite generator', 'AI logo maker', 'WokGen', 'WokSpec'],
  openGraph: {
    title: 'WokGen — AI Generation Studio',
    description: 'Studio for pixel art, brand assets, vectors, UI components, voice, and code.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

const MODES = [
  { id: 'pixel',    label: 'Pixel Art',   accent: 'var(--yellow, #f59e0b)',  desc: 'Sprites, tilesets, and game-ready asset packs.' },
  { id: 'business', label: 'Brand',       accent: 'var(--blue, #3b82f6)',    desc: 'Logos, brand kits, and social visuals.' },
  { id: 'vector',   label: 'Vector',      accent: 'var(--green, #10b981)',   desc: 'SVG icon sets, illustrations, and graphics.' },
  { id: 'uiux',     label: 'UI / UX',     accent: 'var(--pink, #ec4899)',    desc: 'React components, Tailwind sections, and templates.' },
  { id: 'voice',    label: 'Voice',       accent: 'var(--accent)',           desc: 'TTS narration and audio assets.' },
  { id: 'code',     label: 'Text / Code', accent: 'var(--orange, #f97316)', desc: 'Components, docs, SQL, and boilerplate.' },
];

const PROVIDERS = ['FLUX', 'Stable Diffusion', 'Llama 3.3', 'Kokoro'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-24">
        <h1 className="text-5xl font-bold tracking-tight mb-4">WokGen Studio</h1>
        <p className="text-[var(--text-muted)] text-lg max-w-md mb-8 leading-relaxed">
          AI generation for pixel art, brand assets, vectors, UI, voice, and code.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/studio?type=pixel"
            className="inline-flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 font-semibold px-5 py-2.5 rounded-lg transition text-sm text-white"
          >
            Open Studio
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 bg-[var(--surface-raised)] hover:bg-[var(--bg-elevated)] text-[var(--text)] font-semibold px-5 py-2.5 rounded-lg transition text-sm border border-[var(--border)]"
          >
            Browse Tools
          </Link>
        </div>
      </section>

      {/* ── Studio Modes ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MODES.map(mode => (
            <Link
              key={mode.id}
              href={`/studio?type=${mode.id}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 hover:bg-[var(--bg-surface)] hover:border-[var(--border-subtle)] transition-colors group block"
            >
              <div
                className="h-0.5 w-8 rounded-full mb-3 transition-all group-hover:w-12"
                style={{ background: mode.accent }}
              />
              <div className="font-semibold text-sm mb-1">{mode.label}</div>
              <div className="text-[var(--text-muted)] text-xs leading-relaxed">{mode.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Eral ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">AI Director</p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Eral</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-6 max-w-sm text-sm">
              Describe what you&apos;re building. Eral plans your asset pipeline, routes tasks to the right studio, and maintains context across your project.
            </p>
            <Link
              href="/eral"
              className="inline-flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 font-semibold px-5 py-2.5 rounded-lg transition text-sm text-white"
            >
              Open Eral
            </Link>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--text-muted)]">Eral</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="ml-auto max-w-[80%] bg-[var(--surface-raised)] rounded-lg rounded-tr-sm px-3 py-2 text-[var(--text-muted)] text-xs leading-relaxed">
                I need assets for a dark fantasy RPG main menu.
              </div>
              <div className="max-w-[85%] bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg rounded-tl-sm px-3 py-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                Here&apos;s what I&apos;d queue:<br /><br />
                <strong>1.</strong> Hero background — Pixel mode<br />
                <strong>2.</strong> Logo with runic type — Brand mode<br />
                <strong>3.</strong> UI button set — UI/UX mode<br /><br />
                Queue all three?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── API ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">Programmatic</p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">API</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-6 max-w-sm text-sm">
              Programmatic access to every studio mode. Integrate generation into your own tools, pipelines, and workflows.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="/developers"
                className="inline-flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 font-semibold px-5 py-2.5 rounded-lg transition text-sm text-white"
              >
                Docs
              </a>
              <a
                href="/account/api-keys"
                className="inline-flex items-center gap-2 bg-[var(--surface-raised)] hover:bg-[var(--bg-elevated)] text-[var(--text)] font-semibold px-5 py-2.5 rounded-lg transition text-sm border border-[var(--border)]"
              >
                API Keys
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)]">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-subtle)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-subtle)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--border-subtle)]" />
              <span className="ml-2 text-xs text-[var(--text-faint)]">@wokspec/sdk</span>
            </div>
            <pre className="p-4 text-xs leading-relaxed overflow-x-auto text-[var(--text-secondary)] font-mono"><code>{`import WokGen from '@wokspec/sdk';

const wok = new WokGen({ apiKey: 'wok_...' });

const asset = await wok.generate({
  prompt: 'pixel art wizard, 32x32',
  mode: 'pixel',
});

console.log(asset.url);`}</code></pre>
          </div>
        </div>
      </section>

      {/* ── Browser Extension ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-8 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--accent)] border border-[var(--border)] rounded-full px-3 py-1 mb-4">
            In Development
          </span>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Browser Extension</h2>
          <p className="text-[var(--text-muted)] leading-relaxed max-w-md mx-auto mb-6 text-sm">
            Generate assets directly from any browser context. Right-click → generate, inline editing, and direct upload to your WokGen workspace.
          </p>
          <a
            href="https://github.com/WokSpec/WokGen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[var(--surface-raised)] hover:bg-[var(--bg-elevated)] text-[var(--text)] font-semibold px-5 py-2.5 rounded-lg transition text-sm border border-[var(--border)]"
          >
            Follow on GitHub
          </a>
        </div>
      </section>

      {/* ── Footer strip ── */}
      <section className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-sm">
            <a href="https://github.com/WokSpec/WokGen" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">GitHub</a>
            <a href="/changelog" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Changelog</a>
            <a href="/docs" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PROVIDERS.map(p => (
              <span key={p} className="text-xs text-[var(--text-faint)] bg-[var(--surface-raised)] px-2 py-1 rounded border border-[var(--border)]">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
