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
      <div className="tat-skeleton-inner" />
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
        <div className="tat-card-tags">
          {tags.slice(0, 4).map((t) => (
            <span key={t} className="tat-card-tag">{t}</span>
          ))}
        </div>
        <span className="tat-card-author">by {asset.user}</span>
        <div className="tat-card-actions">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tool-page__btn-primary tat-card-download"
          >
            ↓ Download
          </a>
          <span className="tat-card-cc0">CC0</span>
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

        <div className="sfx-filters tat-filters">
          <span className="tat-filter-label">Orientation:</span>
          {ORIENTATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`notify-channel-btn tat-filter-btn${orientation === opt.value ? ' notify-channel-btn--active' : ''}`}
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

        {error && <div className="tool-page__error tat-error">{error}</div>}

        {loading && (
          <div className="assets-grid tat-grid-loading">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonAssetCard key={i} />)}
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="tool-page__card tat-empty-state">
            <div className="tat-empty-icon">🖼️</div>
            <p className="tat-empty-text">Search for an asset to get started</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="tool-page__card tat-empty-state">
            <div className="tat-empty-icon">🔍</div>
            <p className="tat-empty-text">No results found. Try a different search term.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="tat-results-header">
              <span className="tat-results-count">
                Found {totalCount.toLocaleString()} {type}s
              </span>
              <span className="tat-results-license">
                All assets are CC0 — free to use without attribution
              </span>
            </div>
            <div className="assets-grid">
              {results.map((r) => <AssetCard key={r.id} asset={r} />)}
            </div>
            {totalPages > 1 && (
              <div className="tat-pagination">
                <button
                  type="button"
                  className="tool-page__btn-primary tat-pagination-btn"
                  disabled={page <= 1}
                  onClick={() => search(query, page - 1)}
                >
                  ← Prev
                </button>
                <span className="tat-pagination-info">{page} / {totalPages}</span>
                <button
                  type="button"
                  className="tool-page__btn-primary tat-pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => search(query, page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        <p className="tool-page__note tat-note">
          Assets from <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a> — CC0 License
        </p>
      </div>
    </div>
  );
}
