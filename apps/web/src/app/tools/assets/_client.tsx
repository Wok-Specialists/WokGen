'use client';

import { useState, useCallback } from 'react';
import type { PixabayResult } from '@/lib/providers/pixabay';

type AssetType = 'photo' | 'illustration' | 'vector' | 'video';
type Orientation = 'all' | 'horizontal' | 'vertical';

interface AssetsResponse {
  results: PixabayResult[];
  count: number;
  note?: string;
  error?: string;
}

const EXAMPLES = ['mountains', 'abstract art', 'technology', 'nature', 'city', 'pattern', 'gradient'];
const TYPE_TABS: { label: string; value: AssetType }[] = [
  { label: 'Photos', value: 'photo' },
  { label: 'Illustrations', value: 'illustration' },
  { label: 'Vectors', value: 'vector' },
  { label: 'Videos', value: 'video' },
];
const ORIENTATION_OPTIONS: { label: string; value: Orientation }[] = [
  { label: 'All', value: 'all' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' },
];
const PAGE_SIZE = 20;

function SkeletonAssetCard() {
  return (
    <div className="assets-card assets-card--skeleton">
      <div style={{ paddingBottom: '75%', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

function AssetCard({ asset }: { asset: PixabayResult }) {
  const tags = asset.tags.split(',').map((t) => t.trim()).filter(Boolean);
  const imageUrl = asset.webformatURL || asset.previewURL;
  const downloadUrl = asset.largeImageURL ?? asset.pageURL;

  return (
    <div className="assets-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={tags[0] ?? 'Asset'} loading="lazy" />
      <div className="assets-card__overlay">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {tags.slice(0, 4).map((t) => (
            <span key={t} style={{ fontSize: 11, background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>{t}</span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>by {asset.user}</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tool-page__btn-primary"
            style={{ padding: '4px 10px', fontSize: 12, textDecoration: 'none', display: 'inline-flex' }}
          >
            ↓ Download
          </a>
          <span style={{ fontSize: 10, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-glow)', borderRadius: 4, padding: '4px 6px', alignSelf: 'center' }}>CC0</span>
        </div>
      </div>
    </div>
  );
}

export function AssetsClient() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<AssetType>('photo');
  const [orientation, setOrientation] = useState<Orientation>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PixabayResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (q: string, pg = 1, t = type, ori = orientation) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q, type: t, per_page: String(PAGE_SIZE), page: String(pg) });
      if (ori !== 'all') params.set('orientation', ori);
      const res = await fetch(`/api/assets/search?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as AssetsResponse;
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
  }, [type, orientation]);

  const handleSearch = useCallback(() => search(query, 1), [query, search]);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="tool-assets">
      <div className="tool-page__inner">
        <div className="tool-page__header">
          <h1 className="tool-page__title">Asset Library</h1>
          <p className="tool-page__subtitle">Search 5M+ free CC0 images, illustrations, vectors, and videos</p>
        </div>

        <div className="sfx-search">
          <input
            className="input sfx-search__input"
            type="search"
            placeholder="Search assets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search assets"
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

        <div className="assets-type-tabs">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`assets-type-tab${type === tab.value ? ' assets-type-tab--active' : ''}`}
              onClick={() => { setType(tab.value); if (hasSearched) search(query, 1, tab.value, orientation); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sfx-filters" style={{ marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-faint)', marginRight: 8 }}>Orientation:</span>
          {ORIENTATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`notify-channel-btn${orientation === opt.value ? ' notify-channel-btn--active' : ''}`}
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => { setOrientation(opt.value); if (hasSearched) search(query, 1, type, opt.value); }}
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
          <div className="assets-grid" style={{ marginTop: 24 }}>
            {Array.from({ length: 12 }).map((_, i) => <SkeletonAssetCard key={i} />)}
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="tool-page__card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
            <p style={{ color: 'var(--text-faint)' }}>Search for an asset to get started</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="tool-page__card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'var(--text-faint)' }}>No results found. Try a different search term.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Found {totalCount.toLocaleString()} {type}s
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                All assets are CC0 — free to use without attribution
              </span>
            </div>
            <div className="assets-grid">
              {results.map((r) => <AssetCard key={r.id} asset={r} />)}
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
          Assets from <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a> — CC0 License
        </p>
      </div>
    </div>
  );
}
