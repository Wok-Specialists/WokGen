'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface AllStats {
  generation: QueueStats;
  cleanup: QueueStats;
}

export default function AdminJobsPage() {
  const [stats, setStats] = useState<AllStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Queue stats via the admin stats endpoint
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        // Placeholder counts — a dedicated /api/admin/queues endpoint can be wired later
        setStats({
          generation: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
          cleanup:    { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const queues = [
    { name: 'Generation Queue', key: 'generation' as const },
    { name: 'Cleanup Queue',    key: 'cleanup'    as const },
  ];

  return (
    <div className="adm-page adm-page--wide">
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Job Queues</h1>
          <p className="adm-subtitle">BullMQ queue status and management</p>
        </div>
        <Link href="/admin" className="adm-back-link">← Admin</Link>
      </div>

      {loading && <p className="adm-loading">Loading…</p>}

      {!loading && (
        <>
          <div className="adm-grid adm-mb">
            {queues.map(queue => {
              const s = stats?.[queue.key] ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
              return (
                <div key={queue.key} className="adm-card">
                  <h2 className="adm-card-title">{queue.name}</h2>
                  <div className="adm-stat">
                    {[
                      { label: 'Waiting',   value: s.waiting,   color: 'var(--yellow)' },
                      { label: 'Active',    value: s.active,    color: 'var(--blue)' },
                      { label: 'Completed', value: s.completed, color: 'var(--green)' },
                      { label: 'Failed',    value: s.failed,    color: 'var(--danger)' },
                    ].map(stat => (
                      <div key={stat.label} className="adm-stat-item">
                        <div className="adm-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="adm-stat-label">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="adm-card">
            <h2 className="adm-card-title">Queue Notes</h2>
            <p className="adm-notes-text">
              WokGen uses BullMQ backed by Redis (Upstash). Generation jobs are processed by the worker process.
              Failed jobs are retained for 200 counts, completed jobs for 100 counts.
              For full queue inspection, connect directly to Redis or use Bull Board.
            </p>
            <div className="adm-notes-links">
              <Link href="/api/health" target="_blank" className="adm-notes-link">
                View Health Endpoint
              </Link>
              <span className="adm-separator">·</span>
              <Link href="/admin/metrics" className="adm-notes-link">
                Platform Metrics
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
