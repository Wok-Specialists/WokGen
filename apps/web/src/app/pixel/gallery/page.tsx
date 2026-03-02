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
  { id: '',         label: 'All Tools'  },
  { id: 'generate', label: 'Generate'  },
  { id: 'animate',  label: 'Animate'   },
  { id: 'rotate',   label: 'Rotate'    },
  { id: 'inpaint',  label: 'Inpaint'   },
  { id: 'scene',    label: 'Scenes'    },
] as const;

const RARITY_FILTERS = [
  { id: '',          label: 'All',       color: 'var(--text-muted)' },
  { id: 'common',    label: 'Common',    color: '#94B0C2'           },
  { id: 'uncommon',  label: 'Uncommon',  color: '#38B764'           },
  { id: 'rare',      label: 'Rare',      color: '#41A6F6'           },
  { id: 'epic',      label: 'Epic',      color: '#B06EFF'           },
  { id: 'legendary', label: 'Legendary', color: '#FFCD75'           },
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
  pollinations: 'var(--accent)',
};

const PROVIDER_LABELS: Record<string, string> = {
  replicate:    'Replicate',
  fal:          'fal.ai',
  together:     'Together.ai',
  comfyui:      'ComfyUI',
  huggingface:  'HuggingFace',
  pollinations: 'Pollinations',
};

const RARITY_COLORS: Record<string, string> = {
  common:    '#94B0C2',
  uncommon:  '#38B764',
  rare:      '#41A6F6',
  epic:      '#B06EFF',
  legendary: '#FFCD75',
};

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
    <span className="pg-spinner" aria-hidden="true" />
  );
}

function RarityBadge({ rarity }: { rarity: string }) {
  const color = RARITY_COLORS[rarity] ?? 'var(--text-muted)';
  return (
    <span
      className="pg-rarity-badge"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {capitalize(rarity)}
    </span>
  );
}

function ProviderDot({ provider }: { provider: string }) {
  return (
    <span className="pg-provider-badge">
      <span
        className="pg-provider-dot"
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
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
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
    a.download = `wokgen-${asset.id}.png`;
    a.click();
  };

  const ZOOM_STEPS = [1, 2, 4, 8];
  const nextZoom = ZOOM_STEPS[(ZOOM_STEPS.indexOf(zoom) + 1) % ZOOM_STEPS.length];

  return (
    <div
      className="pg-detail-panel"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Prev */}
      {hasPrev && (
        <button type="button"
          onClick={onPrev}
          className="pg-modal-nav pg-modal-nav--prev"
          aria-label="Previous image"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-overlay)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          ←
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button type="button"
          onClick={onNext}
          className="pg-modal-nav pg-modal-nav--next"
          aria-label="Next image"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-overlay)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          →
        </button>
      )}

      {/* Modal card */}
      <div
        className="pg-detail-panel__card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pg-detail__header">
          <div className="pg-detail__header-left">
            {asset.rarity && <RarityBadge rarity={asset.rarity} />}
            <span className="pg-detail__size">
              {asset.size}×{asset.size}px
            </span>
            <ProviderDot provider={asset.provider} />
          </div>
          <div className="pg-detail__header-right">
            <Link
              href={`/studio?prompt=${encodeURIComponent(asset.prompt)}`}
              className="pg-detail__make-similar"
            >
              ✦ Make similar
            </Link>
            <button type="button"
              onClick={download}
              className="pg-detail__download-btn"
            >
              ↓ Download
            </button>
            <button type="button"
              onClick={onClose}
              className="pg-detail__close-btn"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Image area */}
        <div
          className="pg-detail__scroll"
        >
          {/* Canvas */}
          <div
            className="pg-detail__canvas"
            style={{ cursor: zoom < 8 ? 'zoom-in' : 'zoom-out' }}
            onClick={() => setZoom(nextZoom)}
            title={`Click to zoom (${zoom}×) — next: ${nextZoom}×`}
          >
            <img
              src={asset.imageUrl}
              alt={asset.title ?? asset.prompt}
              className="pg-detail__img"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {/* Zoom hint */}
          <div className="pg-detail__zoom-hint">
            Click image to zoom ({zoom}×) · ← → to browse
          </div>

          {/* Metadata */}
          <div className="pg-detail__meta">
            {/* Title */}
            {asset.title && (
              <h2 className="pg-detail__title">
                {asset.title}
              </h2>
            )}

            {/* Prompt */}
            <div className="pg-detail__prompt">
              <div className="pg-detail__prompt-header">
                <span className="pg-detail__section-label">
                  Prompt
                </span>
                <button type="button"
                  onClick={copyPrompt}
                  className="pg-detail__copy-btn"
                  style={{ color: copied ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p
                className="pg-detail__prompt-text"
                onClick={copyPrompt}
                title="Click to copy"
              >
                {asset.prompt}
              </p>
            </div>

            {/* Tags */}
            {asset.tags?.length > 0 && (
              <div className="pg-card__tags">
                {asset.tags.slice(0, 10).map((tag) => (
                  <span
                    key={tag}
                    className="pg-card__tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="pg-detail__meta-row">
              <span className="pg-detail__meta-item">
                {capitalize(asset.tool)}
              </span>
              <span className="pg-detail__meta-item">
                {timeAgo(asset.createdAt)}
              </span>
              <span className="pg-detail__id">
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

function GalleryCard({
  asset,
  index,
  onClick,
  selected,
  onSelect,
}: {
  asset: GalleryAsset;
  index: number;
  onClick: () => void;
  selected: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const rarityColor = asset.rarity ? (RARITY_COLORS[asset.rarity] ?? null) : null;

  return (
    <button type="button"
      onClick={onClick}
      className={`gallery-card pg-card animate-fade-in${selected ? ' gallery-card--selected' : ''}`}
      style={{
        animationDelay: `${Math.min(index * 0.03, 0.4)}s`,
        boxShadow: rarityColor
          ? `0 0 0 1px ${rarityColor}25`
          : undefined,
      }}
      aria-label={asset.title ?? asset.prompt}
    >
      {/* Bulk-select checkbox */}
      <label
        className="gallery-card-checkbox"
        onClick={e => e.stopPropagation()}
        aria-label="Select for download"
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          onClick={e => e.stopPropagation()}
        />
      </label>

      {/* Image */}
      <div className="gallery-card-image">
        <img
          src={asset.thumbUrl ?? asset.imageUrl}
          alt={asset.title ?? asset.prompt}
          loading="lazy"
          className="pg-card__img"
        />

        {/* Rarity corner */}
        {rarityColor && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: 2,
              background: rarityColor,
              boxShadow: `0 0 6px 1px ${rarityColor}60`,
            }}
            title={capitalize(asset.rarity!)}
          />
        )}
      </div>

      {/* Hover download button */}
      <div className="gallery-card-dl-wrap">
        <a
          href={asset.imageUrl}
          download={`wokgen-${asset.id}.png`}
          onClick={e => e.stopPropagation()}
          className="gallery-card-download-btn"
          title="Download"
          aria-label="Download"
        >
          ↓
        </a>
      </div>

      {/* Overlay on hover */}
      <div className="gallery-card-overlay">
        <p className="line-clamp-2 pg-card__overlay-prompt">
          {asset.prompt}
        </p>
        <div className="pg-card__overlay-meta">
          <span className="pg-card__overlay-size">
            {asset.size}px
          </span>
          <span
            className="pg-provider-dot"
            style={{ background: PROVIDER_COLORS[asset.provider] ?? '#666' }}
          />
          <span className="pg-card__overlay-time">
            {timeAgo(asset.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Static showcase tiles (shown when gallery is empty)
// ---------------------------------------------------------------------------

const SHOWCASE_PROMPTS = [
  { prompt: 'iron sword with ornate crossguard, battle-worn blade', tool: 'generate', size: 64 },
  { prompt: 'health potion, glowing red liquid in crystal vial', tool: 'generate', size: 32 },
  { prompt: 'warrior in plate armor, full body, front-facing sprite', tool: 'generate', size: 128 },
  { prompt: 'treasure chest, gold-banded oak, glowing keyhole', tool: 'generate', size: 64 },
  { prompt: 'dungeon stone floor tile, cracked and mossy', tool: 'scene', size: 64 },
  { prompt: 'fire spirit creature, idle breathing animation', tool: 'animate', size: 64 },
  { prompt: 'leather shield with iron boss, dented edge', tool: 'generate', size: 64 },
  { prompt: 'skull key for dungeon door, ancient runes', tool: 'generate', size: 32 },
] as const;

function ShowcaseCard({ item, index }: { item: typeof SHOWCASE_PROMPTS[number]; index: number }) {
  return (
    <a
      href={`/studio?prompt=${encodeURIComponent(item.prompt)}`}
      className="gallery-card pg-showcase-card"
      style={{
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <div className="gallery-card-image">
        {/* Placeholder pixel grid */}
        <div aria-hidden="true" className="pg-thumb-preview">
          <div className="pg-thumb-grid">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="pg-thumb-cell" style={{
                background: [0, 5, 12, 17, 23, 30, 35].includes(i) ? 'var(--accent)' : '#333',
              }} />
            ))}
          </div>
        </div>
      </div>
      <div className="gallery-card-overlay pg-showcase-overlay">
        <p className="pg-card__overlay-prompt">
          {item.prompt}
        </p>
        <div className="pg-card__overlay-meta">
          <span className="pg-showcase-cta">
            Try this →
          </span>
          <span className="pg-card__overlay-size">{item.size}px</span>
        </div>
      </div>
    </a>
  );
}

function EmptyState({ search }: { search: string }) {
  if (search) {
    return (
      <div className="empty-state pg-empty">
        <div className="empty-state-icon"></div>
        <h3 className="empty-state-title">No results for &ldquo;{search}&rdquo;</h3>
        <p className="empty-state-body">Try a different search term or clear filters.</p>
      </div>
    );
  }
  return (
    <>
      <div className="pg-empty-intro">
        <div className="gallery-empty-icon"></div>
        <p className="pg-empty__title">
          No pixel assets yet
        </p>
        <p className="pg-empty__body">
          Generate your first pixel art in Pixel mode.
        </p>
        <a href="/pixel/studio" className="pg-empty__cta">
          Go to Pixel mode →
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

export default function GalleryPage() {
  const { data: session } = useSession();
  const [assets, setAssets]         = useState<GalleryAsset[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore]       = useState(false);
  const [galleryTab, setGalleryTab] = useState<'community' | 'mine'>('community');

  // Filters
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toolFilter, setToolFilter]   = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [sort, setSort]             = useState<'newest' | 'oldest'>('newest');

  // Modal
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const downloadSelected = () => {
    assets
      .filter(a => selectedIds.has(a.id))
      .forEach(a => window.open(a.imageUrl, '_blank'));
  };

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 380);
    return () => clearTimeout(t);
  }, [search]);

  // Initialize filters from URL on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tool'))   setToolFilter(p.get('tool')!);
    if (p.get('rarity')) setRarityFilter(p.get('rarity')!);
    if (p.get('search')) setSearch(p.get('search')!);
    if (p.get('sort') === 'oldest') setSort('oldest');
    if (p.get('tab') === 'mine')    setGalleryTab('mine');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with active filters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams();
    if (toolFilter)        p.set('tool', toolFilter);
    if (rarityFilter)      p.set('rarity', rarityFilter);
    if (debouncedSearch)   p.set('search', debouncedSearch);
    if (sort !== 'newest') p.set('sort', sort);
    if (galleryTab === 'mine') p.set('tab', 'mine');
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [toolFilter, rarityFilter, debouncedSearch, sort, galleryTab]);

  // Fetch on filter change
  useEffect(() => {
    setAssets([]);
    setNextCursor(null);
    setHasMore(false);
    fetchAssets(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, toolFilter, rarityFilter, sort, galleryTab]);

  const fetchAssets = useCallback(
    async (cursor: string | null, reset = false) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: '32', sort, mode: 'pixel' });
        if (cursor)       params.set('cursor', cursor);
        if (toolFilter)   params.set('tool', toolFilter);
        if (rarityFilter) params.set('rarity', rarityFilter);
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
        if (galleryTab === 'mine') params.set('mine', 'true');

        const res = await fetch(`/api/gallery?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: GalleryResponse = await res.json();

        setAssets((prev) => (reset ? data.assets : [...prev, ...data.assets]));
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toolFilter, rarityFilter, sort, debouncedSearch, galleryTab],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchAssets(nextCursor, false);
    }
  }, [fetchAssets, loadingMore, hasMore, nextCursor]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '300px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Keyboard nav for modal
  const handleModalNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i < assets.length - 1 ? i + 1 : i));
  }, [assets.length]);

  const handleModalPrev = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const selectedAsset = selectedIndex !== null ? assets[selectedIndex] : null;

  return (
    <div className="pg-wrapper">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="pg-header">
        <div className="pg-header__inner">
          {/* Title row */}
          <div className="pg-hero">
            <div>
              <h1 className="pg-title">
                Gallery
              </h1>
              <p className="pg-subtitle">
                Publicly saved pixel art assets
              </p>
            </div>

            <div className="pg-header__action">
              <a
                href="/pixel/studio"
                className="pg-new-asset-btn"
              >
                ✦ New Asset
              </a>
            </div>
          </div>

          {/* Filter bar */}
          <div className="pg-filter-bar">
            {/* Search */}
            <div className="pg-search-wrap">
              <span
                className="pg-search-icon"
                aria-hidden="true"
              >
                ⌕
              </span>
              <input
                type="search"
                className="input pg-search-input"
                placeholder="Search prompts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search gallery"
              />
            </div>

            {/* Tool filter */}
            <div className="pg-filter-group">
              {TOOL_FILTERS.map((f) => (
                <button type="button"
                  key={f.id}
                  onClick={() => setToolFilter(f.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.14s ease',
                    background: toolFilter === f.id ? 'var(--accent-dim)' : 'var(--surface-overlay)',
                    border: `1px solid ${toolFilter === f.id ? 'var(--accent-muted)' : 'var(--surface-border)'}`,
                    color: toolFilter === f.id ? 'var(--accent)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Rarity filter */}
            <div className="pg-filter-group">
              {RARITY_FILTERS.map((f) => (
                <button type="button"
                  key={f.id}
                  onClick={() => setRarityFilter(f.id)}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.14s ease',
                    background:
                      rarityFilter === f.id
                        ? `${f.color}18`
                        : 'var(--surface-overlay)',
                    border: `1px solid ${rarityFilter === f.id ? f.color + '50' : 'var(--surface-border)'}`,
                    color: rarityFilter === f.id ? f.color : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              className="select pg-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
              aria-label="Sort order"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="pg-grid-wrap">
        {/* Error banner */}
        {error && (
          <div className="pg-error-banner">
            Failed to load gallery: {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="gallery-grid">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="skeleton pg-skeleton-item"
                style={{
                  animationDelay: `${i * 0.04}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Bulk download bar */}
        {selectedIds.size > 0 && (
          <div className="gallery-bulk-bar">
            <span className="gallery-bulk-bar__count">{selectedIds.size} selected</span>
            <button type="button" className="btn btn--sm" onClick={downloadSelected}>
              ↓ Download selected
            </button>
            <button type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </button>
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
                  selected={selectedIds.has(asset.id)}
                  onSelect={() => toggleSelect(asset.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Load more / infinite scroll sentinel */}
        <div ref={sentinelRef} className="pg-sentinel" />

        {loadingMore && (
          <div className="pg-load-more">
            <Spinner />
            Loading more…
          </div>
        )}

        {!loading && !hasMore && assets.length > 0 && (
          <p className="pg-gallery-end">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} · end of gallery
          </p>
        )}
      </div>

      {/* ── Asset detail modal ───────────────────────────────────────────────── */}
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
