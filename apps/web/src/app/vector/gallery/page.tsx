'use client';




import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GalleryAsset {
  id: string;
  title: string | null;
  imageUrl: string;
  thumbUrl: string | null;
  size: number;
  tool: string;
  provider: string;
  prompt: string;
  tags: string[];
  rarity: string | null;
  isPublic: boolean;
  createdAt: string;
}

interface GalleryResponse {
  assets: GalleryAsset[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOOL_FILTERS = [
  { id: '',             label: 'All Tools'     },
  { id: 'icon',         label: 'Icon'          },
  { id: 'illustration', label: 'Illustration'  },
] as const;

const STYLE_FILTERS = [
  { id: '',        label: 'All'      },
  { id: 'outline', label: 'Outline'  },
  { id: 'filled',  label: 'Filled'   },
  { id: 'rounded', label: 'Rounded'  },
  { id: 'sharp',   label: 'Sharp'    },
] as const;

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
] as const;

const PROVIDER_COLORS: Record<string, string> = {
  replicate:    '#0066FF',
  fal:          '#7B2FBE',
  together:     '#00A67D',
  comfyui:      '#E06C00',
  huggingface:  '#FF9D00',
  pollinations: '#34d399',
};

const PROVIDER_LABELS: Record<string, string> = {
  replicate:    'Replicate',
  fal:          'fal.ai',
  together:     'Together.ai',
  comfyui:      'ComfyUI',
  huggingface:  'HuggingFace',
  pollinations: 'Pollinations',
};

const ACCENT = '#34d399';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <span className="vg2-spinner" aria-hidden="true" />
  );
}

function ProviderDot({ provider }: { provider: string }) {
  return (
    <span className="vg2-provider-dot">
      <span
        className="vg2-provider-dot__dot"
        style={{ background: PROVIDER_COLORS[provider] ?? '#666' }}
      />
      {PROVIDER_LABELS[provider] ?? provider}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Asset Detail Modal
// ---------------------------------------------------------------------------

function AssetModal({
  asset,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  asset: GalleryAsset;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft'  && hasPrev) onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(asset.prompt).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = asset.imageUrl;
    a.download = `wokgen-vector-${asset.id}.png`;
    a.click();
  };

  return (
    <div
      className="vg2-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Prev */}
      {hasPrev && (
        <button type="button"
          onClick={onPrev}
          className="vg2-modal-nav vg2-modal-nav--prev"
          aria-label="Previous image"
        >
          ←
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button type="button"
          onClick={onNext}
          className="vg2-modal-nav vg2-modal-nav--next"
          aria-label="Next image"
        >
          →
        </button>
      )}

      {/* Modal card */}
      <div
        className="vg2-detail-panel"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vg2-modal-header">
          <div className="vg2-modal-header__left">
            <span className="vg2-modal-size">
              {asset.size}×{asset.size}px
            </span>
            <span className="vg2-modal-tool-badge">
              {capitalize(asset.tool)}
            </span>
            <ProviderDot provider={asset.provider} />
          </div>
          <div className="vg2-modal-header__right">
            <Link
              href={`/studio?prompt=${encodeURIComponent(asset.prompt)}`}
              className="vg2-modal-make-similar"
            >
              ✦ Make similar
            </Link>
            <button type="button"
              onClick={download}
              className="vg2-modal-dl-btn"
            >
              ↓ Download
            </button>
            <button type="button"
              onClick={onClose}
              className="vg2-modal-close"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="vg2-modal-body">
          {/* Canvas */}
          <div className="vg2-modal-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.imageUrl}
              alt={asset.title ?? asset.prompt}
              className="vg2-modal-img"
            />
          </div>

          {/* Metadata */}
          <div className="vg2-detail__section">
            {asset.title && (
              <h2 className="vg2-detail__title">
                {asset.title}
              </h2>
            )}

            {/* Prompt */}
            <div className="vg2-prompt-section">
              <div className="vg2-prompt-row">
                <span className="vg2-prompt-label">
                  Prompt
                </span>
                <button type="button"
                  onClick={copyPrompt}
                  className="vg2-copy-btn"
                  style={{ color: copied ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p
                className="vg2-card__prompt"
                onClick={copyPrompt}
                title="Click to copy"
              >
                {asset.prompt}
              </p>
            </div>

            {/* Tags */}
            {asset.tags?.length > 0 && (
              <div className="vg2-card__tags">
                {asset.tags.slice(0, 10).map(tag => (
                  <span key={tag} className="vg2-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="vg2-modal-meta-row">
              <span className="vg2-modal-meta-item">{capitalize(asset.tool)}</span>
              <span className="vg2-modal-meta-item">{timeAgo(asset.createdAt)}</span>
              <span className="vg2-modal-meta-id">
                {asset.id.slice(0, 12)}…
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery card
// ---------------------------------------------------------------------------

function GalleryCard({ asset, index, onClick }: { asset: GalleryAsset; index: number; onClick: () => void }) {
  return (
    <button type="button"
      onClick={onClick}
      className="gallery-card vg2-card animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.4)}s` }}
      aria-label={asset.title ?? asset.prompt}
    >
      <div className="gallery-card-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.thumbUrl ?? asset.imageUrl}
          alt={asset.title ?? asset.prompt}
          loading="lazy"
          className="vg2-card__img"
        />
      </div>

      {/* Hover download button */}
      <div className="gallery-card-dl-wrap">
        <a
          href={asset.imageUrl}
          download={`wokgen-vector-${asset.id}.png`}
          onClick={e => e.stopPropagation()}
          className="gallery-card-download-btn"
          title="Download"
          aria-label="Download"
        >
          ↓
        </a>
      </div>

      <div className="gallery-card-overlay">
        <p className="line-clamp-2 vg2-card__overlay-prompt">
          {asset.prompt}
        </p>
        <div className="vg2-card__info-row">
          <span className="vg2-card__size-label">
            {asset.size}px
          </span>
          <span
            className="vg2-card__provider-dot"
            style={{ background: PROVIDER_COLORS[asset.provider] ?? '#666' }}
          />
          <span className="vg2-card__time-label">
            {timeAgo(asset.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Showcase (empty state)
// ---------------------------------------------------------------------------

const SHOWCASE_PROMPTS = [
  { prompt: 'Settings gear icon, outline style, minimal', tool: 'icon' },
  { prompt: 'Shopping cart icon, filled style, flat design', tool: 'icon' },
  { prompt: 'Bell notification icon, rounded corners', tool: 'icon' },
  { prompt: 'Search magnifier icon, sharp geometric', tool: 'icon' },
  { prompt: 'Flat illustration of a team collaborating', tool: 'illustration' },
  { prompt: 'Vector illustration of a rocket launching', tool: 'illustration' },
  { prompt: 'User profile icon, outlined, minimal', tool: 'icon' },
  { prompt: 'Lock security icon, filled, flat', tool: 'icon' },
] as const;

function ShowcaseCard({ item, index }: { item: typeof SHOWCASE_PROMPTS[number]; index: number }) {
  return (
    <a
      href={`/studio?prompt=${encodeURIComponent(item.prompt)}&tool=${item.tool}`}
      className="gallery-card vg2-showcase-card"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="gallery-card-image">
        <div aria-hidden="true" className="vg2-showcase-placeholder">
          <span className="vg2-showcase-icon">
            {''}
          </span>
        </div>
      </div>
      <div className="gallery-card-overlay vg2-showcase-overlay">
        <p className="vg2-showcase-prompt">
          {item.prompt}
        </p>
        <div className="vg2-showcase-cta-row">
          <span className="vg2-showcase-cta">
            Try this →
          </span>
        </div>
      </div>
    </a>
  );
}

function EmptyState({ search }: { search: string }) {
  if (search) {
    return (
      <div className="empty-state vg2-empty-search">
        <div className="empty-state-icon"></div>
        <h3 className="empty-state-title">No results for &ldquo;{search}&rdquo;</h3>
        <p className="empty-state-body">Try a different search term or clear filters.</p>
      </div>
    );
  }
  return (
    <>
      <div className="vg2-empty">
        <div className="vg2-empty__icon">⬡</div>
        <h3 className="vg2-empty__title">
          No vector assets yet
        </h3>
        <p className="vg2-empty__body">
          Generate your first vector in Vector mode.
        </p>
        <a href="/vector/studio" className="vg2-empty__cta">
          ✦ Open Vector mode
        </a>
      </div>
      {SHOWCASE_PROMPTS.map((item, i) => (
        <ShowcaseCard key={i} item={item} index={i} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function VectorGalleryPage() {
  const { data: session } = useSession();
  const [assets, setAssets]               = useState<GalleryAsset[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [nextCursor, setNextCursor]       = useState<string | null>(null);
  const [hasMore, setHasMore]             = useState(false);
  const [galleryTab, setGalleryTab]       = useState<'community' | 'mine'>('community');

  // Filters
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toolFilter, setToolFilter]       = useState('');
  const [styleFilter, setStyleFilter]     = useState('');
  const [sort, setSort]                   = useState<'newest' | 'oldest'>('newest');

  // Modal
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 380);
    return () => clearTimeout(t);
  }, [search]);

  // Initialize filters from URL on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('search'))     setSearch(p.get('search')!);
    if (p.get('tool'))       setToolFilter(p.get('tool')!);
    if (p.get('style'))      setStyleFilter(p.get('style')!);
    if (p.get('sort') === 'oldest') setSort('oldest');
    if (p.get('tab') === 'mine')    setGalleryTab('mine');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with active filters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams();
    if (search)                  p.set('search', search);
    if (toolFilter)              p.set('tool', toolFilter);
    if (styleFilter)             p.set('style', styleFilter);
    if (sort !== 'newest')       p.set('sort', sort);
    if (galleryTab !== 'community') p.set('tab', galleryTab);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [search, toolFilter, styleFilter, sort, galleryTab]);

  // Fetch on filter change
  useEffect(() => {
    setAssets([]);
    setNextCursor(null);
    setHasMore(false);
    fetchAssets(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, toolFilter, styleFilter, sort, galleryTab]);

  const fetchAssets = useCallback(
    async (cursor: string | null, reset = false) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: '32', sort, mode: 'vector' });
        if (cursor)           params.set('cursor', cursor);
        if (toolFilter)       params.set('tool', toolFilter);
        if (styleFilter)      params.set('tags', styleFilter);
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
        if (galleryTab === 'mine') params.set('mine', 'true');

        const res = await fetch(`/api/gallery?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: GalleryResponse = await res.json();

        setAssets(prev => (reset ? data.assets : [...prev, ...data.assets]));
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toolFilter, styleFilter, sort, debouncedSearch, galleryTab],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) fetchAssets(nextCursor, false);
  }, [fetchAssets, loadingMore, hasMore, nextCursor]);

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) loadMore(); },
      { rootMargin: '300px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Modal navigation
  const handleModalNext = useCallback(() => {
    setSelectedIndex(i => (i !== null && i < assets.length - 1 ? i + 1 : i));
  }, [assets.length]);

  const handleModalPrev = useCallback(() => {
    setSelectedIndex(i => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const selectedAsset = selectedIndex !== null ? assets[selectedIndex] ?? null : null;

  // Suppress unused session warning — kept for potential future auth-gating
  void session;

  return (
    <div className="vg2-wrapper">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="vg2-header">
        <div className="vg2-inner">
          {/* Title row */}
          <div className="vg2-title-row">
            <div className="vg2-header__title-section">
              <h1 className="vg2-title">
                Vector Gallery
              </h1>
              <p className="vg2-subtitle">
                Vector-style icons, illustrations, and design system components
              </p>
            </div>

            <div className="vg2-header__actions">
              {/* Community / Mine tabs */}
              <div className="vg2-tab-group">
                {(['community', 'mine'] as const).map(tab => (
                  <button type="button"
                    key={tab}
                    onClick={() => setGalleryTab(tab)}
                    className="vg2-tab-btn"
                    style={{
                      background: galleryTab === tab ? 'var(--accent-subtle)' : 'var(--surface-overlay)',
                      border: `1px solid ${galleryTab === tab ? ACCENT + '50' : 'var(--surface-border)'}`,
                      color: galleryTab === tab ? ACCENT : 'var(--text-muted)',
                    }}
                  >
                    {tab === 'community' ? 'Community' : 'My Assets'}
                  </button>
                ))}
              </div>

              <a href="/vector/studio" className="vg2-new-asset-btn">
                ✦ New Asset
              </a>
            </div>
          </div>

          {/* Filter bar */}
          <div className="vg2-filter-bar">
            {/* Search */}
            <div className="vg2-search-wrap">
              <span className="vg2-search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                className="input vg2-search-input"
                placeholder="Search prompts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search gallery"
              />
            </div>

            {/* Tool filter */}
            <div className="vg2-filter-group">
              {TOOL_FILTERS.map(f => (
                <button type="button"
                  key={f.id}
                  onClick={() => setToolFilter(f.id)}
                  className="vg2-filter-pill"
                  style={{
                    background: toolFilter === f.id ? 'var(--accent-subtle)' : 'var(--surface-overlay)',
                    border: `1px solid ${toolFilter === f.id ? ACCENT + '50' : 'var(--surface-border)'}`,
                    color: toolFilter === f.id ? ACCENT : 'var(--text-muted)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Style filter */}
            <div className="vg2-filter-group vg2-filter-group--wrap">
              {STYLE_FILTERS.map(f => (
                <button type="button"
                  key={f.id}
                  onClick={() => setStyleFilter(f.id)}
                  className="vg2-filter-pill"
                  style={{
                    background: styleFilter === f.id ? 'var(--accent-subtle)' : 'var(--surface-overlay)',
                    border: `1px solid ${styleFilter === f.id ? ACCENT + '50' : 'var(--surface-border)'}`,
                    color: styleFilter === f.id ? ACCENT : 'var(--text-muted)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              className="select vg2-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
              aria-label="Sort order"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="vg2-grid-container">
        {/* Error */}
        {error && (
          <div className="vg2-error">
            Failed to load gallery: {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="gallery-grid">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="skeleton vg2-skeleton-item"
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        )}

        {/* Asset grid */}
        {!loading && (
          <div className="gallery-grid">
            {assets.length === 0 ? (
              <EmptyState search={debouncedSearch} />
            ) : (
              assets.map((asset, i) => (
                <GalleryCard
                  key={asset.id}
                  asset={asset}
                  index={i}
                  onClick={() => setSelectedIndex(i)}
                />
              ))
            )}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="vg2-sentinel" />

        {loadingMore && (
          <div className="vg2-loading-more">
            <Spinner />
            Loading more…
          </div>
        )}

        {!loading && !hasMore && assets.length > 0 && (
          <p className="vg2-end-msg">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} · end of gallery
          </p>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {selectedAsset && selectedIndex !== null && (
        <AssetModal
          asset={selectedAsset}
          onClose={() => setSelectedIndex(null)}
          onNext={handleModalNext}
          onPrev={handleModalPrev}
          hasNext={selectedIndex < assets.length - 1}
          hasPrev={selectedIndex > 0}
        />
      )}
    </div>
  );
}
