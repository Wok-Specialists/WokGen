'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface EnhanceResponse {
  variations?: string[];
  error?: string;
}

const MODE_FROM_PATH: Record<string, string> = {
  pixel: 'pixel',
  vector: 'vector',
  business: 'business',
  uiux: 'uiux',
  voice: 'voice',
  code: 'code',
  audio: 'voice',
  text: 'pixel',
};

function getMode(pathname: string): string {
  const segment = pathname.split('/')[1] ?? '';
  return MODE_FROM_PATH[segment] ?? 'pixel';
}

export function PromptFAB() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Only render on studio pages
  if (!pathname?.includes('/studio')) return null;

  const mode = getMode(pathname);

  const enhance = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setVariations([]);
    setEnhancedPrompt('');
    try {
      const res = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), mode }),
      });
      const data = await res.json() as EnhanceResponse;
      if (!res.ok || data.error) throw new Error(data.error ?? 'Enhancement failed');
      const vars = data.variations ?? [];
      setVariations(vars);
      setEnhancedPrompt(vars[0] ?? prompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enhancement unavailable');
    } finally {
      setLoading(false);
    }
  }, [prompt, mode]);

  const usePrompt = (p: string) => {
    navigator.clipboard.writeText(p).then(() => {
      toast.success('Prompt copied to clipboard!');
      setOpen(false);
    }).catch(() => toast.error('Copy failed'));
  };

  return (
    <div className={`prompt-fab${open ? ' prompt-fab--open' : ''}`}>
      {open && (
        <div className="prompt-fab__panel" role="dialog" aria-label="Prompt Lab">
          <div className="prompt-fab__panel-header">
            <span style={{ fontWeight: 600, fontSize: 14 }}>✨ Prompt Lab</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
              aria-label="Close Prompt Lab"
            >
              ×
            </button>
          </div>

          <div className="prompt-fab__panel-body">
            <label className="tool-page__label" style={{ fontSize: 12 }}>
              Mode: <strong style={{ color: 'var(--accent)' }}>{mode}</strong>
            </label>
            <textarea
              className="tool-page__textarea"
              placeholder="Enter a prompt to enhance…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              style={{ fontSize: 13, marginTop: 4 }}
            />

            <button
              type="button"
              className="tool-page__btn-primary"
              onClick={enhance}
              disabled={loading || !prompt.trim()}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Enhancing…' : '✨ Enhance'}
            </button>

            {error && (
              <div className="tool-page__error" style={{ marginTop: 8, fontSize: 12 }}>
                {error}
              </div>
            )}

            {enhancedPrompt && !error && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>Enhanced:</div>
                <div
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  {enhancedPrompt}
                </div>
                <button
                  type="button"
                  className="tool-page__btn-primary"
                  style={{ width: '100%', fontSize: 12 }}
                  onClick={() => usePrompt(enhancedPrompt)}
                >
                  Use this prompt ↗
                </button>
              </div>
            )}

            {variations.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>Suggestions:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {variations.slice(1, 4).map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => usePrompt(v)}
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.12s',
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="prompt-fab__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Prompt Lab"
        title="Prompt Lab"
      >
        ✨
      </button>
    </div>
  );
}
