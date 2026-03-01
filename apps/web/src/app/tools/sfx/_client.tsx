'use client';

import { useState, useCallback, useRef } from 'react';

interface SfxResult {
  id: number;
  name: string;
  description: string;
  duration: number;
  url: string;
  preview_url: string | null;
  license: string;
  username?: string;
  tags?: string[];
}

interface SfxResponse {
  results: SfxResult[];
  count: number;
  note?: string;
  error?: string;
}

const EXAMPLES = ['explosion', 'ambient rain', 'footsteps', 'laser shot', 'crowd cheer', 'wind', 'click', 'notification'];
const DURATION_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Short <3s', value: '3' },
  { label: 'Medium <10s', value: '10' },
  { label: 'Long <30s', value: '30' },
];
const PAGE_SIZE = 10;

function SkeletonCard() {
  return (
    <div className="sfx-card sfx-card--skeleton">
      <div className="sfx-card__waveform" style={{ background: 'var(--surface-raised)' }} />
      <div style={{ padding: '10px 12px' }}>
        <div className="skeleton-line" style={{ width: '70%', height: 13, marginBottom: 6 }} />
        <div className="skeleton-line" style={{ width: '40%', height: 11 }} />
      </div>
    </div>
  );
}

function SfxCard({ result }: { result: SfxResult }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!result.preview_url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(result.preview_url);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }, [result.preview_url, playing]);

  const tags = result.tags ?? [];
  const licenseShort = result.license.includes('Creative Commons') ? 'CC' : result.license.slice(0, 10);

  return (
    <div className="sfx-card">
      <div
        className="sfx-card__waveform"
        style={{ background: `linear-gradient(90deg, var(--accent-voice) 0%, var(--accent) 50%, var(--accent-pixel) 100%)`, opacity: playing ? 1 : 0.5 }}
      />
      <div style={{ padding: '10px 12px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <span className="tool-page__label" style={{ margin: 0, fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {result.name}
          </span>
          <span className="tool-page__confidence-badge" style={{ flexShrink: 0 }}>{result.duration.toFixed(1)}s</span>
        </div>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="tool-interrogate__tag" style={{ padding: '2px 7px', fontSize: 11 }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{licenseShort}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="sfx-card__play"
              onClick={togglePlay}
              disabled={!result.preview_url}
              aria-label={playing ? 'Pause' : 'Play preview'}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-page__btn-primary"
              style={{ padding: '4px 10px', fontSize: 12, textDecoration: 'none', display: 'inline-flex' }}
            >
              ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SfxClient() {
  const [query, setQuery] = useState('');
  const [durationMax, setDurationMax] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SfxResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (q: string, pg = 1, durMax = durationMax) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q, page: String(pg), pageSize: String(PAGE_SIZE) });
      if (durMax) params.set('duration_max', durMax);
      const res = await fetch(`/api/sfx/search?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as SfxResponse;
      if (data.error) throw new Error(data.error);
      setResults(data.results ?? []);
      setTotalCount(data.count ?? 0);
      setPage(pg);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [durationMax]);

  const handleSearch = useCallback(() => search(query, 1), [query, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="tool-sfx">
      <div className="tool-page__inner">
        <div className="tool-page__header">
          <h1 className="tool-page__title">SFX Library</h1>
          <p className="tool-page__subtitle">Search 600K+ CC-licensed sound effects from Freesound.org</p>
        </div>

        <div className="sfx-search">
          <input
            className="input sfx-search__input"
            type="search"
            placeholder="Search sounds…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search sounds"
          />
          <button
            type="button"
            className="tool-page__btn-primary"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? '…' : 'Search'}
          </button>
        </div>

        <div className="sfx-filters">
          <span style={{ fontSize: 12, color: 'var(--text-faint)', marginRight: 8 }}>Duration:</span>
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`notify-channel-btn${durationMax === opt.value ? ' notify-channel-btn--active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => { setDurationMax(opt.value); if (hasSearched) search(query, 1, opt.value); }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="tool-music__examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="tool-music__example-chip"
              onClick={() => { setQuery(ex); search(ex, 1); }}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && <div className="tool-page__error" style={{ marginTop: 16 }}>{error}</div>}

        {loading && (
          <div className="sfx-grid" style={{ marginTop: 24 }}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="tool-page__card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔊</div>
            <p style={{ color: 'var(--text-faint)' }}>Search for a sound effect to get started</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="tool-page__card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔇</div>
            <p style={{ color: 'var(--text-faint)' }}>No results found. Try a different search term.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {totalCount.toLocaleString()} results
              </span>
            </div>
            <div className="sfx-grid">
              {results.map((r) => <SfxCard key={r.id} result={r} />)}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  className="tool-page__btn-primary"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                  disabled={page <= 1}
                  onClick={() => search(query, page - 1)}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
                <button
                  type="button"
                  className="tool-page__btn-primary"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                  disabled={page >= totalPages}
                  onClick={() => search(query, page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        <p className="tool-page__note" style={{ marginTop: 24 }}>
          Sounds from <a href="https://freesound.org" target="_blank" rel="noopener noreferrer">Freesound.org</a> — Creative Commons licensed
        </p>
      </div>
    </div>
  );
}
