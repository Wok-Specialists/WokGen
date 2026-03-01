'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface WorkspaceItem {
  id: string;
  name: string;
  mode: string;
  jobCount: number;
}

interface WorkspaceSelectorProps {
  mode: string;
  activeWorkspaceId: string | null;
  onChange: (id: string | null) => void;
}

const LS_KEY = (mode: string) => `wokgen:workspace:${mode}`;

export default function WorkspaceSelector({ mode, activeWorkspaceId, onChange }: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isOpen,     setIsOpen]     = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName,    setNewName]    = useState('');
  const [creating,   setCreating]   = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal,  setRenameVal]  = useState('');
  const [deleteConf, setDeleteConf] = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const renameRef   = useRef<HTMLInputElement>(null);

  const activeName = workspaces.find(w => w.id === activeWorkspaceId)?.name ?? null;

  // ── Fetch workspaces on mount ────────────────────────────────────────────
  const fetchWorkspaces = useCallback(async () => {
    try {
      const res  = await fetch(`/api/workspaces?mode=${mode}`);
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(data.workspaces ?? []);
        // Restore from localStorage — verify it still exists
        const stored = localStorage.getItem(LS_KEY(mode));
        if (stored && data.workspaces?.some((w: WorkspaceItem) => w.id === stored)) {
          // Already active — no-op (parent controls this)
        } else if (stored) {
          // Stale — clear it
          localStorage.removeItem(LS_KEY(mode));
          onChange(null);
        }
      }
    } catch {
      // Non-fatal: workspace list just won't show
    }
  }, [mode, onChange]);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  // ── Click-outside close ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setDeleteConf(null);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  // ── Auto-focus new-name input ────────────────────────────────────────────
  useEffect(() => {
    if (isCreating) setTimeout(() => newInputRef.current?.focus(), 50);
  }, [isCreating]);

  // ── Auto-focus rename input ──────────────────────────────────────────────
  useEffect(() => {
    if (renamingId) setTimeout(() => renameRef.current?.focus(), 50);
  }, [renamingId]);

  // ── Create workspace ─────────────────────────────────────────────────────
  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res  = await fetch('/api/workspaces', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: newName.trim(), mode }),
      });
      const data = await res.json();
      if (res.ok) {
        const ws: WorkspaceItem = data.workspace;
        setWorkspaces(prev => [ws, ...prev]);
        localStorage.setItem(LS_KEY(mode), ws.id);
        onChange(ws.id);
        setNewName('');
        setIsCreating(false);
        setIsOpen(false);
      } else {
        setError(data.error ?? 'Failed to create workspace');
      }
    } finally {
      setCreating(false);
    }
  }

  // ── Rename workspace ─────────────────────────────────────────────────────
  async function handleRename(id: string) {
    if (!renameVal.trim()) { setRenamingId(null); return; }
    try {
      const res  = await fetch(`/api/workspaces/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: renameVal.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: data.workspace.name } : w));
      }
    } finally {
      setRenamingId(null);
    }
  }

  // ── Delete workspace ─────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (activeWorkspaceId === id) {
        localStorage.removeItem(LS_KEY(mode));
        onChange(null);
      }
    } finally {
      setDeleteConf(null);
    }
  }

  // ── Select workspace ─────────────────────────────────────────────────────
  function handleSelect(id: string | null) {
    if (id) localStorage.setItem(LS_KEY(mode), id);
    else    localStorage.removeItem(LS_KEY(mode));
    onChange(id);
    setIsOpen(false);
  }

  return (
    <div ref={dropRef} className="ws-selector">
      {/* Trigger */}
      <button type="button" onClick={() => setIsOpen(v => !v)} className="ws-trigger">
        <span className="ws-trigger__icon" aria-hidden="true">⊡</span>
        <span className="ws-trigger__label">{activeName ?? 'All Generations'}</span>
        <span className="ws-trigger__chevron" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="ws-dropdown">
          {/* All generations option */}
          <button type="button" onClick={() => handleSelect(null)}
            className={`ws-option${activeWorkspaceId === null ? ' ws-option--active' : ''}`}
          >
            <span className="ws-option__icon" aria-hidden="true">∞</span>
            <span className="ws-option__name">All Generations</span>
            {activeWorkspaceId === null && <span className="ws-option__check" aria-hidden="true">✓</span>}
          </button>

          {/* Workspace list */}
          {workspaces.length > 0 && (
            <div className="ws-list">
              {workspaces.map(ws => (
                <div key={ws.id}>
                  {renamingId === ws.id ? (
                    <div className="ws-rename-row">
                      <input
                        ref={renameRef}
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(ws.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onBlur={() => handleRename(ws.id)}
                        maxLength={40}
                        className="ws-rename-input"
                      />
                    </div>
                  ) : deleteConf === ws.id ? (
                    <div className="ws-delete-confirm">
                      <span className="ws-delete-confirm__label">Delete &ldquo;{ws.name}&rdquo;?</span>
                      <button type="button" onClick={() => handleDelete(ws.id)} className="ws-btn ws-btn--danger">Delete</button>
                      <button type="button" onClick={() => setDeleteConf(null)} className="ws-btn ws-btn--ghost">Cancel</button>
                    </div>
                  ) : (
                    <div role="group" className={`ws-item${activeWorkspaceId === ws.id ? ' ws-item--active' : ''}`}>
                      <button type="button" onClick={() => handleSelect(ws.id)}
                        className="ws-item__btn"
                      >
                        <span className="ws-option__icon" aria-hidden="true">⊡</span>
                        <span className="ws-item__name">{ws.name}</span>
                        <span className="ws-item__count">{ws.jobCount}</span>
                        {activeWorkspaceId === ws.id && <span className="ws-option__check" aria-hidden="true">✓</span>}
                      </button>
                      <span className="ws-action-icons">
                        <button type="button" onClick={() => { setRenamingId(ws.id); setRenameVal(ws.name); }}
                          title="Rename" className="ws-action-btn">Edit</button>
                        <button type="button" onClick={() => setDeleteConf(ws.id)}
                          title="Delete workspace" className="ws-action-btn ws-action-btn--del">×</button>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Create workspace */}
          <div className="ws-create">
            {error && <p className="ws-error">{error}</p>}
            {isCreating ? (
              <div className="ws-rename-row">
                <input
                  ref={newInputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setIsCreating(false); setNewName(''); setError(null); }
                  }}
                  maxLength={40}
                  placeholder="Workspace name…"
                  disabled={creating}
                  className="ws-rename-input"
                />
                <button type="button" onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="ws-btn ws-btn--create"
                >
                  {creating ? '…' : 'OK'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => { setIsCreating(true); setError(null); }}
                className="ws-option ws-option--new"
              >
                <span aria-hidden="true">+</span>
                New workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
