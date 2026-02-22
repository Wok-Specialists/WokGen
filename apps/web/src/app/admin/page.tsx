'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  users: { total: number; activeThisMonth: number; byPlan: Record<string, number> };
  jobs:  { total: number; today: number; hd: number; standard: number };
  recentJobs: { id: string; prompt: string; provider: string; status: string; createdAt: string; user?: { email: string } }[];
  generatedAt: string;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '1.25rem 1.5rem',
    }}>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 .5rem', fontFamily: 'var(--font-heading)' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '.25rem 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : r.json().then((d: { error?: string }) => Promise.reject(d.error ?? `HTTP ${r.status}`)))
      .then(setStats)
      .catch((e: string) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>
            Admin
          </h1>
          {stats && (
            <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: '.25rem 0 0' }}>
              Last updated {new Date(stats.generatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <Link href="/studio" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Studio
        </Link>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 4, padding: '1rem', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Users */}
          <section style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', margin: '0 0 .875rem', fontFamily: 'var(--font-heading)' }}>Users</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)' }}>
              <StatCard label="Total users" value={stats.users.total} />
              <StatCard label="Active this month" value={stats.users.activeThisMonth} sub="with at least 1 generation" />
              {Object.entries(stats.users.byPlan).map(([plan, count]) => (
                <StatCard key={plan} label={`Plan: ${plan}`} value={count} />
              ))}
            </div>
          </section>

          {/* Jobs */}
          <section style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', margin: '0 0 .875rem', fontFamily: 'var(--font-heading)' }}>Generations</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)' }}>
              <StatCard label="Total jobs" value={stats.jobs.total.toLocaleString()} />
              <StatCard label="Today" value={stats.jobs.today.toLocaleString()} />
              <StatCard label="HD (Replicate)" value={stats.jobs.hd.toLocaleString()} />
              <StatCard label="Standard (Pollinations)" value={stats.jobs.standard.toLocaleString()} />
            </div>
          </section>

          {/* Recent jobs */}
          <section>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', margin: '0 0 .875rem', fontFamily: 'var(--font-heading)' }}>Recent generations</p>
            <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              {stats.recentJobs.map((job, i) => (
                <div key={job.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center', gap: '1rem',
                  padding: '.75rem 1rem',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.prompt}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', margin: '.15rem 0 0' }}>{job.user?.email ?? 'guest'}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: job.provider === 'replicate' ? '#c4b5fd' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {job.provider === 'replicate' ? 'HD' : 'std'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
