'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SkeletonGalleryGrid } from '@/app/_components/Skeleton';
// Inline Search icon since lucide-react is not a dependency
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
interface LibraryAsset {
  id: string;
  imageUrl: string;
  thumbUrl: string | null;
  prompt: string;
  mode: string;
  tool: string;
  createdAt: string;
}

const BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function LibraryClient() {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (search: string, mode: string, sortBy: string, append = false, afterCursor?: string) => {
    if (!append) setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams({ mine: 'true', limit: '48' });
    if (search.trim()) params.set('search', search.trim());
    if (mode !== 'all') params.set('mode', mode);
    if (sortBy === 'oldest') params.set('sort', 'oldest');
    if (afterCursor) params.set('cursor', afterCursor);
    try {
      const res = await fetch(`/api/gallery?${params}`);
      if (res.ok) {
        const d = await res.json();
        let fetched: LibraryAsset[] = d.assets ?? [];
        if (sortBy === 'mode') {
          fetched = [...fetched].sort((a, b) => a.mode.localeCompare(b.mode));
        }
        if (append) {
          setAssets(prev => [...prev, ...fetched]);
        } else {
          setAssets(fetched);
        }
        setCursor(d.nextCursor ?? null);
        setHasMore(d.hasMore ?? false);
        setTotal(prev => append ? prev + fetched.length : fetched.length);
      } else {
        const d = await res.json().catch(() => null);
        setFetchError(d?.error ?? 'Failed to load assets');
      }
    } catch {
      setFetchError('Network error — could not load assets');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets(searchQuery, modeFilter, sort);
  }, [searchQuery, modeFilter, sort, fetchAssets]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(assets.map(a => a.id)));
  }, [assets]);

  const clearSelection = useCallback(() => { setSelected(new Set()); setConfirmBulkDelete(false); }, []);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const bulkDelete = useCallback(async () => {
    if (!selected.size) return;
    if (!confirmBulkDelete) { setConfirmBulkDelete(true); return; }
    setConfirmBulkDelete(false);
    setDeleting(true);
    setDeleteError(null);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map(id => fetch(`/api/gallery?id=${id}`, { method: 'DELETE' }))
    );
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)).length;
    const succeeded = results.length - failed;
    setAssets(prev => {
      const deletedIds = new Set(ids.filter((_, i) => results[i].status === 'fulfilled' && (results[i] as PromiseFulfilledResult<Response>).value.ok));
      return prev.filter(a => !deletedIds.has(a.id));
    });
    setTotal(prev => Math.max(0, prev - succeeded));
    setSelected(new Set());
    if (failed > 0) setDeleteError(`${failed} asset${failed > 1 ? 's' : ''} could not be deleted.`);
    setDeleting(false);
  }, [selected, confirmBulkDelete]);

  const bulkDownload = useCallback(async () => {
    const selectedAssets = assets.filter(a => selected.has(a.id));
    for (const asset of selectedAssets) {
      try {
        // Fetch as blob to force download for cross-origin CDN URLs
        const res = await fetch(asset.imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `wokgen-${asset.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {
        // Skip failed downloads silently
      }
    }
  }, [assets, selected]);

  if (loading && assets.length === 0 && !fetchError) {
    return (
      <div className="lib-page">
        <SkeletonGalleryGrid count={12} />
      </div>
    );
  }

  if (fetchError && assets.length === 0) {
    return (
      <div className="lib-page">
        <div className="lib-error-bar">
          <span>{fetchError}</span>
          <button type="button" onClick={() => fetchAssets(searchQuery, modeFilter, sort)} className="lib-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lib-page">
      {/* Header */}
      <div className="lib-header">
        <div>
          <h1 className="lib-title">Asset Library</h1>
          <p className="lib-subtitle">
            {total} asset{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/gallery" className="lib-gallery-link">
          Gallery View
        </Link>
      </div>

      {/* Bulk action toolbar */}
      {selected.size > 0 && (
        <div className="lib-bulk-bar">
          <span className="lib-bulk-count">{selected.size} selected</span>
          <button type="button" onClick={selectAll} className="lib-bulk-select-all">Select all</button>
          <div className="lib-bulk-spacer" />
          {deleteError && <span className="lib-bulk-error">{deleteError}</span>}
          <button type="button" onClick={bulkDownload} className="lib-bulk-download-btn">
            Download {selected.size}
          </button>
          <button
            type="button"
            onClick={bulkDelete}
            disabled={deleting}
            className="lib-bulk-delete-btn"
            style={{ opacity: deleting ? 0.6 : 1, fontWeight: confirmBulkDelete ? 700 : 400 }}
          >
            {deleting ? 'Deleting…' : confirmBulkDelete ? `Confirm delete ${selected.size}?` : `Delete ${selected.size}`}
          </button>
          <button type="button" onClick={clearSelection} className="lib-bulk-close-btn">✕</button>
        </div>
      )}

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text)]/30" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by prompt..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded text-sm text-[var(--text)]/80 placeholder:text-[var(--text)]/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <select
          value={modeFilter}
          onChange={e => setModeFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-[var(--text)]/60"
        >
          <option value="all">All modes</option>
          <option value="pixel">Pixel</option>
          <option value="vector">Vector</option>
          <option value="uiux">UI/UX</option>
          <option value="business">Business</option>
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-[var(--text)]/60"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mode">By mode</option>
        </select>
      </div>

      {assets.length === 0 && !loading ? (
        /* Designed empty state */
        <div className="lib-empty">
          <div className="lib-empty__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <h3 className="lib-empty__title">
            {searchQuery || modeFilter !== 'all' ? 'No matching assets' : 'Your library is empty'}
          </h3>
          <p className="lib-empty__desc">
            {searchQuery || modeFilter !== 'all'
              ? 'Try a different search or filter.'
              : 'Generated assets will appear here.'}
          </p>
          {!searchQuery && modeFilter === 'all' && (
            <Link href="/studio" className="btn btn-primary lib-empty__cta">
              Open WokGen Studio
            </Link>
          )}
        </div>
      ) : (
        <div className="lib-grid">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="group relative rounded overflow-hidden border hover:border-white/20 transition-all lib-card"
              style={{ borderColor: selected.has(asset.id) ? 'var(--accent)' : 'var(--border)' }}
              onClick={() => toggleSelect(asset.id)}
            >
              {/* Checkbox overlay */}
              <div
                className="lib-card__checkbox group-hover:!opacity-100"
                style={{
                  background: selected.has(asset.id) ? 'var(--accent)' : 'var(--overlay-60)',
                  borderColor: selected.has(asset.id) ? 'var(--accent)' : 'var(--border)',
                  opacity: selected.has(asset.id) ? 1 : 0,
                }}
              >
                {selected.has(asset.id) && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <div className="lib-card__thumb">
                {(asset.thumbUrl ?? asset.imageUrl) && (
                  <Image
                    src={asset.thumbUrl ?? asset.imageUrl}
                    alt={asset.prompt?.slice(0, 60) || 'Asset'}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                  />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3">
                  <p className="text-xs text-[var(--text)] line-clamp-3">{asset.prompt}</p>
                  <div className="flex gap-2 mt-2">
                    <a
                      href={asset.imageUrl}
                      download
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-[var(--text)]"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      Save
                    </a>
                    <Link
                      href={`/studio?prompt=${encodeURIComponent(asset.prompt)}&mode=${asset.mode}`}
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-[var(--text)]"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      Reuse
                    </Link>
                  </div>
                </div>
              </div>
              <div className="lib-card__body">
                {asset.prompt && (
                  <p className="lib-card__prompt">
                    {asset.prompt}
                  </p>
                )}
                <div className="lib-card__footer">
                  <span className="lib-card__mode">{asset.mode || 'pixel'}</span>
                  {asset.imageUrl && (
                    <a href={asset.imageUrl} download target="_blank" rel="noopener noreferrer" className="lib-card__download">Download</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <div className="lib-load-more">
          <button
            type="button"
            onClick={() => fetchAssets(searchQuery, modeFilter, sort, true, cursor ?? undefined)}
            disabled={loading}
            className="lib-load-more__btn"
            style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Loading…' : `Load more`}
          </button>
        </div>
      )}
    </div>
  );
}
