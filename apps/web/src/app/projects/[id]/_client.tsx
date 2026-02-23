'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetTag { tag: string }
interface Job {
  id: string; tool: string; mode: string; prompt: string;
  resultUrl: string | null; provider: string; createdAt: string;
  assetTags: AssetTag[];
}
interface Relationship {
  id: string; fromJobId: string; toJobId: string; type: string; createdAt: string;
}
interface Brief {
  genre?: string; artStyle?: string; paletteJson?: string;
  brandName?: string; industry?: string; colorHex?: string; styleGuide?: string;
}
interface Props {
  projectId: string; projectName: string; projectMode: string; brief: Brief | null;
}

const REL_LABELS: Record<string, string> = {
  variation: 'Variation', animation_of: 'Animation', enemy_of: 'Enemy',
  tileset_for: 'Tileset', same_palette: 'Same palette', brand_use: 'Brand use',
};

const REL_COLORS: Record<string, string> = {
  variation: '#a78bfa', animation_of: '#60a5fa', enemy_of: '#f87171',
  tileset_for: '#34d399', same_palette: '#fbbf24', brand_use: '#fb923c',
};

const MODE_STUDIOS: Record<string, string> = {
  pixel: '/pixel/studio', business: '/business/studio', vector: '/vector/studio',
  emoji: '/emoji/studio', uiux: '/uiux/studio', voice: '/voice/studio', text: '/text/studio',
};

// ─── Asset grid card ─────────────────────────────────────────────────────────

function AssetCard({
  job, isSelected, isHighlighted, onSelect, linkedIds,
}: {
  job: Job;
  isSelected: boolean;
  isHighlighted: boolean;
  linkedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  const hasLink = linkedIds.has(job.id);
  return (
    <button
      className={[
        'project-asset-card',
        isSelected    && 'project-asset-card--selected',
        isHighlighted && 'project-asset-card--highlighted',
        hasLink       && 'project-asset-card--linked',
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect(job.id)}
      title={job.prompt}
    >
      {job.resultUrl ? (
        <img
          src={job.resultUrl}
          alt={job.prompt.slice(0, 60)}
          className="project-asset-card__img"
          loading="lazy"
        />
      ) : (
        <div className="project-asset-card__placeholder">
          <span>{job.tool}</span>
        </div>
      )}
      <div className="project-asset-card__overlay">
        <span className="project-asset-card__tool">{job.tool}</span>
        {hasLink && <span className="project-asset-card__link-dot" title="Has relationships" />}
      </div>
      {isSelected && (
        <div className="project-asset-card__selected-ring" aria-label="Selected" />
      )}
    </button>
  );
}

// ─── Relationship panel ───────────────────────────────────────────────────────

function RelationshipPanel({
  projectId, fromJobId, existingRels, jobs,
  onCreated, onClose,
}: {
  projectId: string; fromJobId: string;
  existingRels: Relationship[]; jobs: Job[];
  onCreated: () => void; onClose: () => void;
}) {
  const [toJobId, setToJobId] = useState('');
  const [type, setType]       = useState('variation');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const fromJob = jobs.find(j => j.id === fromJobId);
  const candidates = jobs.filter(j => j.id !== fromJobId);

  const create = async () => {
    if (!toJobId) { setError('Pick a target asset.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromJobId, toJobId, type }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); return; }
      onCreated();
      onClose();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="rel-panel">
      <div className="rel-panel__header">
        <h3 className="rel-panel__title">Link asset</h3>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>✕</button>
      </div>
      <div className="rel-panel__from">
        <span className="rel-panel__label">From:</span>
        <span className="rel-panel__prompt">{fromJob?.prompt.slice(0, 60)}…</span>
      </div>
      <div className="rel-panel__field">
        <label className="rel-panel__label">Relationship type</label>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(REL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="rel-panel__field">
        <label className="rel-panel__label">Target asset</label>
        <select className="input" value={toJobId} onChange={e => setToJobId(e.target.value)}>
          <option value="">— pick an asset —</option>
          {candidates.map(j => (
            <option key={j.id} value={j.id}>{j.prompt.slice(0, 60)}</option>
          ))}
        </select>
      </div>
      {error && <p className="rel-panel__error">{error}</p>}
      <div className="rel-panel__actions">
        <button className="btn btn--primary btn--sm" onClick={create} disabled={saving}>
          {saving ? 'Saving…' : 'Create link'}
        </button>
      </div>
    </div>
  );
}

// ─── Brief panel ─────────────────────────────────────────────────────────────

function BriefPanel({ projectId, brief, mode, onSaved }: {
  projectId: string; brief: Brief | null; mode: string; onSaved: (b: Brief) => void;
}) {
  const [form, setForm] = useState<Brief>(brief ?? {});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/brief`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { const d = await res.json(); onSaved(d.brief); }
    setSaving(false);
  };

  const isGame = ['pixel', 'vector', 'emoji'].includes(mode);

  return (
    <div className="brief-panel">
      <h3 className="brief-panel__title">Project brief</h3>
      {isGame ? (
        <>
          <div className="brief-panel__field">
            <label>Genre</label>
            <select className="input" value={form.genre ?? ''} onChange={e => setForm(f => ({ ...f, genre: e.target.value || undefined }))}>
              <option value="">— not set —</option>
              <option value="dungeon_crawler">Dungeon crawler</option>
              <option value="platformer">Platformer</option>
              <option value="top_down_rpg">Top-down RPG</option>
              <option value="city_builder">City builder</option>
              <option value="match_3">Match-3</option>
              <option value="shoot_em_up">Shoot-em-up</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="brief-panel__field">
            <label>Art style</label>
            <select className="input" value={form.artStyle ?? ''} onChange={e => setForm(f => ({ ...f, artStyle: e.target.value || undefined }))}>
              <option value="">— not set —</option>
              <option value="nes_16color">NES 16-color</option>
              <option value="snes_32color">SNES 32-color</option>
              <option value="gb_monochrome">Game Boy mono</option>
              <option value="modern_pixel">Modern pixel art</option>
              <option value="16bit_rpg">16-bit RPG</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="brief-panel__field">
            <label>Brand name</label>
            <input className="input" value={form.brandName ?? ''} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} placeholder="Acme Inc." />
          </div>
          <div className="brief-panel__field">
            <label>Industry</label>
            <input className="input" value={form.industry ?? ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="SaaS, e-commerce…" />
          </div>
          <div className="brief-panel__field">
            <label>Primary color</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="color" value={form.colorHex ?? '#a78bfa'} onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer' }} />
              <input className="input" style={{ flex: 1 }} value={form.colorHex ?? ''} onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))} placeholder="#a78bfa" />
            </div>
          </div>
          <div className="brief-panel__field">
            <label>Style guide</label>
            <textarea className="input" rows={3} value={form.styleGuide ?? ''} onChange={e => setForm(f => ({ ...f, styleGuide: e.target.value }))} placeholder="Minimal, modern, trustworthy…" />
          </div>
        </>
      )}
      <button className="btn btn--primary btn--sm" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save brief'}
      </button>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function ProjectDashboard({ projectId, projectName, projectMode, brief: initialBrief }: Props) {
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [relationships, setRels]      = useState<Relationship[]>([]);
  const [brief, setBrief]             = useState<Brief | null>(initialBrief);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [showRelPanel, setShowRelPanel] = useState(false);
  const [showBriefPanel, setShowBriefPanel] = useState(!initialBrief);
  const [exporting, setExporting]     = useState(false);
  const [view, setView]               = useState<'grid' | 'relationships'>('grid');

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/assets`);
    if (res.ok) {
      const d = await res.json();
      setJobs(d.jobs ?? []);
      setRels(d.relationships ?? []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Compute set of job IDs that have at least one relationship
  const linkedIds = new Set<string>();
  for (const r of relationships) {
    linkedIds.add(r.fromJobId);
    linkedIds.add(r.toJobId);
  }

  // When a card is selected, highlight its connected assets
  const highlightedIds = new Set<string>();
  if (selectedId) {
    for (const r of relationships) {
      if (r.fromJobId === selectedId) highlightedIds.add(r.toJobId);
      if (r.toJobId   === selectedId) highlightedIds.add(r.fromJobId);
    }
  }

  const handleSelect = (id: string) => {
    setSelectedId(prev => prev === id ? null : id);
    setShowRelPanel(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/export`);
      if (!res.ok) { alert('Export failed — no succeeded assets yet?'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_assets.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const studioUrl = MODE_STUDIOS[projectMode] ?? '/pixel/studio';

  // Relationships for selected asset
  const selectedRels = selectedId
    ? relationships.filter(r => r.fromJobId === selectedId || r.toJobId === selectedId)
    : [];

  return (
    <div className="project-dashboard">
      {/* Header */}
      <div className="project-dashboard__header">
        <div className="project-dashboard__header-left">
          <h1 className="project-dashboard__title">{projectName}</h1>
          <span className="project-dashboard__mode-badge">{projectMode}</span>
        </div>
        <div className="project-dashboard__header-actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowBriefPanel(v => !v)}
          >
            {showBriefPanel ? 'Hide brief' : brief ? 'Edit brief' : 'Set brief'}
          </button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={handleExport}
            disabled={exporting || jobs.length === 0}
          >
            {exporting ? 'Exporting…' : '↓ Export ZIP'}
          </button>
          <Link href={`${studioUrl}?project=${projectId}`} className="btn btn--primary btn--sm">
            + Generate
          </Link>
        </div>
      </div>

      {/* View toggle */}
      <div className="project-dashboard__tabs">
        <button
          className={`project-tab ${view === 'grid' ? 'project-tab--active' : ''}`}
          onClick={() => setView('grid')}
        >
          Assets ({jobs.length})
        </button>
        <button
          className={`project-tab ${view === 'relationships' ? 'project-tab--active' : ''}`}
          onClick={() => setView('relationships')}
        >
          Relationships ({relationships.length})
        </button>
      </div>

      <div className="project-dashboard__body">
        {/* Left: main content */}
        <div className="project-dashboard__main">
          {loading ? (
            <div className="project-skeleton">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-block skeleton-block--square" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="project-empty">
              <p>No assets yet.</p>
              <Link href={`${studioUrl}?project=${projectId}`} className="btn btn--primary">
                Generate your first asset
              </Link>
            </div>
          ) : view === 'grid' ? (
            <>
              <p className="project-hint">
                Click an asset to see its connections.{' '}
                {selectedId && 'Click "Link asset" to add a relationship.'}
              </p>
              <div className="project-asset-grid">
                {jobs.map(j => (
                  <AssetCard
                    key={j.id}
                    job={j}
                    isSelected={selectedId === j.id}
                    isHighlighted={highlightedIds.has(j.id)}
                    linkedIds={linkedIds}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
              {selectedId && (
                <div className="project-selected-panel">
                  <div className="project-selected-panel__header">
                    <h3>Selected asset</h3>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => { setShowRelPanel(v => !v); }}
                    >
                      Link asset
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => setSelectedId(null)}>Deselect</button>
                  </div>
                  {selectedRels.length > 0 && (
                    <div className="project-selected-rels">
                      <span className="project-selected-rels__label">Linked to:</span>
                      {selectedRels.map(r => {
                        const otherId = r.fromJobId === selectedId ? r.toJobId : r.fromJobId;
                        const other   = jobs.find(j => j.id === otherId);
                        return (
                          <span key={r.id} className="rel-chip" style={{ '--rel-color': REL_COLORS[r.type] ?? '#a78bfa' } as React.CSSProperties}>
                            <span className="rel-chip__type">{REL_LABELS[r.type]}</span>
                            {other && <span className="rel-chip__name">{other.prompt.slice(0, 30)}…</span>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {showRelPanel && (
                    <RelationshipPanel
                      projectId={projectId}
                      fromJobId={selectedId}
                      existingRels={relationships}
                      jobs={jobs}
                      onCreated={load}
                      onClose={() => setShowRelPanel(false)}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            /* Relationships view */
            <div className="project-rel-list">
              {relationships.length === 0 ? (
                <p className="project-hint">No relationships yet. Select an asset to link it to another.</p>
              ) : (
                relationships.map(r => {
                  const from = jobs.find(j => j.id === r.fromJobId);
                  const to   = jobs.find(j => j.id === r.toJobId);
                  return (
                    <div key={r.id} className="project-rel-row">
                      <div className="project-rel-row__asset">
                        {from?.resultUrl && <img src={from.resultUrl} alt="" className="project-rel-row__thumb" />}
                        <span className="project-rel-row__prompt">{from?.prompt.slice(0, 40)}…</span>
                      </div>
                      <span
                        className="project-rel-row__type"
                        style={{ color: REL_COLORS[r.type] ?? '#a78bfa' }}
                      >
                        ──{REL_LABELS[r.type]}──▶
                      </span>
                      <div className="project-rel-row__asset">
                        {to?.resultUrl && <img src={to.resultUrl} alt="" className="project-rel-row__thumb" />}
                        <span className="project-rel-row__prompt">{to?.prompt.slice(0, 40)}…</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right: brief panel */}
        {showBriefPanel && (
          <div className="project-dashboard__sidebar">
            <BriefPanel
              projectId={projectId}
              brief={brief}
              mode={projectMode}
              onSaved={(b) => { setBrief(b); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
