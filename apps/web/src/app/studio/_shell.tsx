'use client';

/**
 * WokGen Unified Studio Shell
 *
 * One studio. All asset types accessible from a single, persistent left rail.
 * Each studio client is loaded on demand — no rewrite of existing studio logic.
 *
 * URL: /studio?type=pixel | vector | uiux | voice | business | code
 */

import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ── Studio type definitions ──────────────────────────────────────────────────

const STUDIO_TYPES = [
  { id: 'pixel',    label: 'Pixel',    abbr: 'PX', description: 'Game assets & sprites' },
  { id: 'vector',   label: 'Vector',   abbr: 'VC', description: 'Icons & illustrations' },
  { id: 'business', label: 'Brand',    abbr: 'BR', description: 'Logos & brand kits' },
  { id: 'uiux',     label: 'UI/UX',    abbr: 'UI', description: 'Components & mockups' },
  { id: 'voice',    label: 'Voice',    abbr: 'VO', description: 'Audio & speech' },
  { id: 'code',     label: 'Code',     abbr: 'CD', description: 'Components & code gen' },
] as const;

type StudioType = (typeof STUDIO_TYPES)[number]['id'];

// ── Lazy-load each studio client ─────────────────────────────────────────────

const PixelClient    = dynamic(() => import('@/app/pixel/studio/_client'),    { ssr: false });
const VectorClient   = dynamic(() => import('@/app/vector/studio/_client'),   { ssr: false });
const BusinessClient = dynamic(() => import('@/app/business/studio/_client'), { ssr: false });
const UIUXClient     = dynamic(() => import('@/app/uiux/studio/_client'),     { ssr: false });
const VoiceClient    = dynamic(() => import('@/app/voice/studio/_client'),    { ssr: false });
const CodeClient     = dynamic(() => import('@/app/studio/code/page'),        { ssr: false });

function StudioContent({ type }: { type: StudioType }) {
  switch (type) {
    case 'pixel':    return <PixelClient />;
    case 'vector':   return <VectorClient />;
    case 'business': return <BusinessClient />;
    case 'uiux':     return <UIUXClient />;
    case 'voice':    return <VoiceClient />;
    case 'code':     return <CodeClient />;
    default:         return <PixelClient />;
  }
}

// ── Unified shell ────────────────────────────────────────────────────────────

interface Props {
  type: StudioType;
}

export default function UnifiedStudioClient({ type }: Props) {
  const router = useRouter();

  const navigate = (t: StudioType) => {
    router.push(`/studio?type=${t}`);
  };

  return (
    <div className="wok-studio-shell">
      {/* ── Type rail ────────────────────────────────────────────────────── */}
      <nav className="wok-studio-rail" aria-label="Studio type">
        <div className="wok-studio-rail__wordmark">WS</div>
        <div className="wok-studio-rail__items">
          {STUDIO_TYPES.map(({ id, abbr, label, description }) => (
            <button
              key={id}
              className={`wok-studio-rail__item${type === id ? ' --active' : ''}`}
              onClick={() => navigate(id)}
              title={`${label} — ${description}`}
              aria-label={label}
              aria-pressed={type === id}
            >
              <span className="wok-studio-rail__abbr">{abbr}</span>
              <span className="wok-studio-rail__label">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Studio content ───────────────────────────────────────────────── */}
      <div className="wok-studio-content">
        <Suspense fallback={
          <div className="wok-studio-loading">
            <div className="wok-studio-loading__spinner" />
          </div>
        }>
          <StudioContent type={type} />
        </Suspense>
      </div>

      <style>{`
        .wok-studio-shell {
          display: flex;
          height: calc(100dvh - var(--nav-height, 56px));
          overflow: hidden;
          background: var(--surface-base, #0d0d14);
        }

        /* ── Rail ───────────────────────────────────────────────────────── */
        .wok-studio-rail {
          display: flex;
          flex-direction: column;
          width: 52px;
          flex-shrink: 0;
          background: #09090f;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 12px 0;
          gap: 2px;
          overflow: hidden;
        }

        .wok-studio-rail__wordmark {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.15);
          text-align: center;
          padding: 4px 0 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 6px;
        }

        .wok-studio-rail__items {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
        }

        .wok-studio-rail__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          width: 100%;
          padding: 10px 4px;
          background: none;
          border: none;
          border-left: 2px solid transparent;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s, color 0.1s;
          color: rgba(255,255,255,0.25);
        }
        .wok-studio-rail__item:hover {
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.6);
        }
        .wok-studio-rail__item.--active {
          background: rgba(65,166,246,0.06);
          border-left-color: #41a6f6;
          color: #41a6f6;
        }

        .wok-studio-rail__abbr {
          font-family: ui-monospace, monospace;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
        }
        .wok-studio-rail__label {
          font-size: 0.48rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          line-height: 1;
          opacity: 0.7;
        }

        /* ── Content ────────────────────────────────────────────────────── */
        .wok-studio-content {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Loading state */
        .wok-studio-loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .wok-studio-loading__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: #41a6f6;
          border-radius: 9999px;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
