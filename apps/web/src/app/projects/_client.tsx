'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmptyState } from '@/app/_components/EmptyState';
// Inline Search icon since lucide-react is not a dependency
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

interface RecentAsset {
  id: string;
  imageUrl: string;
  thumbUrl: string | null;
}

interface Project {
  id: string;
  name: string;
  mode: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { jobs: number };
  recentAssets?: RecentAsset[];
}

const BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<string>('updated');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error ?? 'Failed to load projects');
        setProjects([]);
      } else {
        const d = await res.json();
        setProjects(d.projects ?? []);
      }
    } catch (e) {
      setError('Network error while loading projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteProject = useCallback(async (id: string, name: string) => {
    if (!confirmDelete || confirmDelete.id !== id) {
      setConfirmDelete({ id, name });
      return;
    }
    setConfirmDelete(null);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setDeleteError(d?.error ?? 'Failed to delete project');
        return;
      }
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {
      setDeleteError('Network error — could not delete project');
    }
  }, [confirmDelete]);

  const filtered = projects
    .filter(p => !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'assets') return b._count.jobs - a._count.jobs;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  if (loading) {
    return <div className="projects-page"><p className="proj-loading">Loading…</p></div>;
  }

  return (
    <div className="projects-page">
      <div className="proj-header">
        <h1 className="proj-title">Projects</h1>
        <Link href="/projects/new" className="proj-new-btn">
          + New project
        </Link>
      </div>

      {/* Search + sort bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text)]/30" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded text-sm text-[var(--text)]/80 placeholder:text-[var(--text)]/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-[var(--text)]/60"
        >
          <option value="updated">Last updated</option>
          <option value="name">Name</option>
          <option value="assets">Asset count</option>
        </select>
      </div>

      {error ? (
        <div className="proj-error">Error loading projects: {error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching projects' : 'No projects yet'}
          description={searchQuery ? 'Try a different search.' : 'No projects yet. Create your first project.'}
          action={!searchQuery ? { label: 'Create project', href: '/projects/new' } : undefined}
        />
      ) : (
        <>
          {deleteError && (
            <div className="proj-delete-error">
              <span>{deleteError}</span>
              <button type="button" onClick={() => setDeleteError(null)} className="proj-delete-error__close">✕</button>
            </div>
          )}
          <div className="proj-grid">
            {filtered.map(p => (
              <div key={p.id} className="proj-card">
                {/* Asset thumbnail preview strip */}
                <div className="grid grid-cols-4 gap-1 overflow-hidden proj-card__strip">
                  {[0, 1, 2, 3].map(i => {
                    const asset = p.recentAssets?.[i];
                    return (
                      <div key={i} className="aspect-square bg-white/5 relative overflow-hidden">
                        {asset && (
                          <Image
                            src={asset.thumbUrl ?? asset.imageUrl}
                            alt=""
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            placeholder="blur"
                            blurDataURL={BLUR_PLACEHOLDER}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Card body */}
                <div className="proj-card__body">
                  <div className="proj-card__meta">
                    <span className="proj-card__name">{p.name}</span>
                    <span className="proj-card__count">{p._count.jobs} asset{p._count.jobs !== 1 ? 's' : ''}</span>
                  </div>
                  {p.description && <p className="proj-card__desc">{p.description}</p>}
                  <p className="proj-card__date">{p.mode} · updated {new Date(p.updatedAt).toLocaleDateString()}</p>

                  {/* Quick action buttons */}
                  <div className="proj-card__actions">
                    <Link href={`/projects/${p.id}`} className="proj-card__open">
                      Open
                    </Link>
                    <Link href={`/library?projectId=${p.id}`} className="proj-card__assets-link">
                      Assets
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteProject(p.id, p.name)}
                      className="proj-card__delete-btn"
                      style={{ background: confirmDelete?.id === p.id ? 'var(--danger-bg)' : 'transparent', fontWeight: confirmDelete?.id === p.id ? 700 : 400 }}
                      title={confirmDelete?.id === p.id ? 'Click again to confirm' : 'Delete project'}
                    >
                      {confirmDelete?.id === p.id ? 'Confirm?' : 'Delete'}
                    </button>
                    {confirmDelete?.id === p.id && (
                      <button type="button" onClick={() => setConfirmDelete(null)} className="proj-card__cancel-btn">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
