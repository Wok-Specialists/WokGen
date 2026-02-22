'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  user: { name: string | null; email: string | null; image: string | null };
  plan: {
    id: string;
    name: string;
    creditsPerMonth: number;
    periodEnd: string | null;
  } | null;
  hdCredits: {
    monthlyAlloc: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    topUp: number;
  };
}

interface UsageStats {
  allTime:   { total: number; hd: number; standard: number };
  thisMonth: { total: number; hd: number; standard: number };
  today:     { total: number; hd: number; standard: number };
  daily:     { date: string; total: number; hd: number; standard: number }[];
  recent:    { id: string; prompt: string; tool: string; resultUrl: string | null; createdAt: string; hd: boolean }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString();
}

function relativeDay(isoDate: string) {
  const d    = new Date(isoDate);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

// ─── Spark bar chart (30-day) ─────────────────────────────────────────────────

function SparkChart({ daily }: { daily: UsageStats['daily'] }) {
  const max = Math.max(...daily.map(d => d.total), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40, width: '100%' }}>
      {daily.map(d => {
        const pct    = d.total / max;
        const hdPct  = d.hd / Math.max(d.total, 1);
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.total} total (${d.hd} HD)`}
            style={{ flex: 1, height: `${Math.max(pct * 100, 4)}%`, borderRadius: 1, position: 'relative', overflow: 'hidden', background: 'var(--border)' }}
          >
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${hdPct * 100}%`, background: '#a78bfa', borderRadius: 1 }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function CreditBar({ used, total, label }: { used: number; total: number; label: string }) {
  if (total === 0) return null;
  const pct = Math.min(100, Math.round((used / total) * 100));
  const danger = pct >= 90;
  const warn   = pct >= 70;
  const color  = danger ? '#ef4444' : warn ? '#f59e0b' : '#a78bfa';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          {fmt(used)} / {fmt(total)} used
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: danger ? '#ef4444' : 'var(--text-faint)' }}>
        {fmt(total - used)} remaining
      </span>
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-heading)' }}>{label}</span>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{fmt(Number(value))}</span>
      {sub && <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{sub}</span>}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-heading)', margin: 0 }}>
      {children}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccountClient({ user, plan, hdCredits }: Props) {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { setUsage(d); setLoadingUsage(false); })
      .catch(() => setLoadingUsage(false));
  }, []);

  const planId     = plan?.id ?? 'free';
  const isFree     = planId === 'free';
  const totalHd    = hdCredits.monthlyRemaining + hdCredits.topUp;
  const periodDate = plan?.periodEnd ? new Date(plan.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', color: 'var(--text)', margin: 0, marginBottom: '0.25rem' }}>
          Account
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
          Track your credits, usage, and manage your plan.
        </p>
      </div>

      {/* ── Credit balance (hero card) ─────────────────────────────── */}
      <Card style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <SectionLabel>HD Credit Balance</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {fmt(totalHd)}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>credits available</span>
            </div>
            {isFree && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.4rem', margin: '0.4rem 0 0' }}>
                Standard generation is always unlimited and free.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/billing" className="btn-primary" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              {isFree ? 'Get HD credits →' : 'Buy top-up →'}
            </Link>
            {!isFree && (
              <Link href="/billing" style={{ fontSize: '0.75rem', color: '#a78bfa', textDecoration: 'none', textAlign: 'center' }}>
                Manage plan
              </Link>
            )}
          </div>
        </div>

        {/* Progress bars */}
        {hdCredits.monthlyAlloc > 0 && (
          <CreditBar
            used={hdCredits.monthlyUsed}
            total={hdCredits.monthlyAlloc}
            label={`Monthly HD credits${periodDate ? ` · resets ${periodDate}` : ''}`}
          />
        )}
        {hdCredits.topUp > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top-up bank</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa' }}>{fmt(hdCredits.topUp)} credits · never expire</span>
          </div>
        )}
        {isFree && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { id: 'micro',  label: 'Micro',  price: '$1',  credits: 30 },
              { id: 'small',  label: 'Small',  price: '$3',  credits: 100 },
              { id: 'medium', label: 'Medium', price: '$8',  credits: 400 },
              { id: 'large',  label: 'Large',  price: '$20', credits: 1200, best: true },
            ].map(pack => (
              <Link
                key={pack.id}
                href={`/billing#packs`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '0.15rem', padding: '0.6rem 0.9rem',
                  background: pack.best ? 'rgba(167,139,250,.1)' : 'var(--bg-elevated)',
                  border: `1px solid ${pack.best ? 'rgba(167,139,250,.3)' : 'var(--border)'}`,
                  borderRadius: 4, textDecoration: 'none', minWidth: 72,
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>{pack.price}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{pack.credits} HD</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* ── Usage stats ────────────────────────────────────────────── */}
      <Card>
        <SectionLabel>Generation Usage</SectionLabel>

        {loadingUsage ? (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {['Today','This month','All time'].map(l => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
                <div style={{ width: 48, height: 24, background: 'var(--border)', borderRadius: 2 }} />
              </div>
            ))}
          </div>
        ) : usage ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem' }}>
              <Stat label="Today"      value={usage.today.total}     sub={usage.today.hd > 0 ? `${usage.today.hd} HD` : 'Standard only'} />
              <Stat label="This month" value={usage.thisMonth.total} sub={usage.thisMonth.hd > 0 ? `${usage.thisMonth.hd} HD · ${usage.thisMonth.standard} standard` : 'Standard only'} />
              <Stat label="All time"   value={usage.allTime.total}   sub={`${usage.allTime.hd} HD · ${usage.allTime.standard} standard`} />
            </div>

            {/* Spark chart */}
            {usage.daily.some(d => d.total > 0) && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Last 30 days</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                      <span style={{ width: 8, height: 8, background: '#a78bfa', borderRadius: 1, display: 'inline-block' }} /> HD
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                      <span style={{ width: 8, height: 8, background: 'var(--border)', borderRadius: 1, display: 'inline-block' }} /> Standard
                    </span>
                  </div>
                </div>
                <SparkChart daily={usage.daily} />
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>No generation history yet. <Link href="/pixel/studio" style={{ color: '#a78bfa', textDecoration: 'none' }}>Open Studio →</Link></p>
        )}
      </Card>

      {/* ── Recent generations ─────────────────────────────────────── */}
      {usage && usage.recent.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionLabel>Recent Generations</SectionLabel>
            <Link href="/pixel/studio" style={{ fontSize: '0.75rem', color: '#a78bfa', textDecoration: 'none' }}>Open Studio →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {usage.recent.map((job, i) => (
              <div
                key={job.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.65rem 0',
                  borderBottom: i < usage.recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 40, height: 40, borderRadius: 3, flexShrink: 0,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  overflow: 'hidden', imageRendering: 'pixelated',
                }}>
                  {job.resultUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.resultUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }} />
                  )}
                </div>

                {/* Prompt */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {job.prompt}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', margin: '0.1rem 0 0' }}>
                    {job.tool} · {relativeDay(job.createdAt)}
                  </p>
                </div>

                {/* HD badge */}
                {job.hd && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
                    color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.25)', borderRadius: 2,
                    padding: '1px 5px', flexShrink: 0,
                  }}>HD</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Plan ───────────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <SectionLabel>Plan</SectionLabel>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', margin: '0.4rem 0 0', fontFamily: 'var(--font-heading)' }}>
              {plan?.name ?? 'Free'}
              {plan?.creditsPerMonth ? (
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  · {fmt(plan.creditsPerMonth)} HD credits/mo
                </span>
              ) : null}
            </p>
            {periodDate && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: '0.25rem 0 0' }}>
                Renews {periodDate}
              </p>
            )}
          </div>
          <Link href="/billing" className="btn-ghost" style={{ fontSize: '0.8rem' }}>
            {isFree ? 'Upgrade plan →' : 'Manage plan →'}
          </Link>
        </div>
      </Card>

      {/* ── Profile ────────────────────────────────────────────────── */}
      <Card>
        <SectionLabel>Profile</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? ''} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
              {(user.name ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user.name ?? '—'}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>{user.email ?? '—'}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            alignSelf: 'flex-start', background: 'none',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4,
            color: '#ef4444', padding: '0.4rem 0.85rem',
            fontSize: '0.8rem', cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
        >
          Sign out
        </button>
      </Card>

    </main>
  );
}
