export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatNumber } from '@/lib/format';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics — WokGen' };

// Map generation count to a heat colour (purple-scale like GitHub)
function heatColour(count: number): string {
  if (count === 0) return 'var(--surface-raised)';
  if (count === 1) return 'var(--accent-glow)';
  if (count <= 3) return 'var(--accent)';
  if (count <= 5) return 'var(--accent)';
  return 'var(--purple)';
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/analytics');

  const userId = session.user.id;
  const now = new Date();

  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalGenerations, recentJobs, eralMessages, usagePeriod, topToolsRaw] = await Promise.all([
    prisma.job.count({ where: { userId, status: 'succeeded' } }),
    prisma.job.findMany({
      where: { userId, status: 'succeeded', createdAt: { gte: ninetyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, tool: true, mode: true, createdAt: true, resultUrl: true, prompt: true },
    }),
    prisma.eralMessage.count({
      where: { role: 'user', conversation: { userId } },
    }),
    prisma.usagePeriod.findFirst({
      where: { userId, periodStart: { gte: startOfMonth } },
      orderBy: { periodStart: 'desc' },
    }),
    prisma.job.groupBy({
      by: ['tool'],
      where: { userId, status: 'succeeded' },
      _count: { _all: true },
      orderBy: { _count: { tool: 'desc' } },
      take: 5,
    }),
  ]);

  // ── 90-day heatmap ──────────────────────────────────────────────────────────
  const dayMap = new Map<string, number>();
  for (let i = 0; i < 90; i++) {
    const d = new Date(ninetyDaysAgo);
    d.setDate(d.getDate() + i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const job of recentJobs) {
    const key = job.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }

  // Pad to a full week grid (Sunday-first) so cells align as columns = weeks
  const heatDays = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));
  const startDow = ninetyDaysAgo.getDay(); // 0 = Sun
  const padCells = startDow;

  // ── Derived stats ───────────────────────────────────────────────────────────
  const creditsUsed = usagePeriod?.imagesUsed ?? 0;
  const uniqueTools = new Set(topToolsRaw.map((t) => t.tool)).size;
  const recentActivity = recentJobs.slice(0, 10);

  return (
    <main className="analytics-page">
      <h1 className="analytics-h1">Your Analytics</h1>
      <p className="analytics-sub">Personal usage stats for your WokGen account.</p>

      {/* ── Stats cards ── */}
      <div className="analytics-stat-grid">
        {[
          { label: 'TOTAL GENERATIONS', value: formatNumber(totalGenerations) },
          { label: 'TOOLS USED', value: formatNumber(uniqueTools) },
          { label: 'ERAL MESSAGES', value: formatNumber(eralMessages) },
          { label: 'CREDITS THIS MONTH', value: formatNumber(creditsUsed) },
        ].map(({ label, value }) => (
          <div key={label} className="card analytics-stat-card">
            <div className="analytics-stat-label">{label}</div>
            <div className="analytics-stat-value">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Activity heatmap ── */}
      <div className="card analytics-card">
        <h2 className="analytics-card-h2">Activity — last 90 days</h2>
        <div className="analytics-heatmap">
          {Array.from({ length: padCells }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {heatDays.map(({ date, count }) => (
            <div
              key={date}
              title={`${date}: ${count} generation${count !== 1 ? 's' : ''}`}
              className="analytics-heatmap-cell"
              style={{ backgroundColor: heatColour(count) }}
            />
          ))}
        </div>
        <div className="analytics-heatmap-legend">
          <span>Less</span>
          {[0, 1, 2, 4, 6].map((v, i) => (
            <div key={i} className="analytics-heatmap-cell" style={{ backgroundColor: heatColour(v) }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* ── Top tools ── */}
      {topToolsRaw.length > 0 && (
        <div className="card analytics-card">
          <h2 className="analytics-card-h2">Top Tools</h2>
          <div className="analytics-tools-list">
            {topToolsRaw.map((t) => {
              const pct = totalGenerations > 0 ? Math.round((t._count._all / totalGenerations) * 100) : 0;
              return (
                <div key={t.tool} className="analytics-tool-row">
                  <div className="analytics-tool-name">{t.tool}</div>
                  <div className="analytics-tool-bar-track">
                    <div className="analytics-tool-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="analytics-tool-count">{t._count._all}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent generations ── */}
      <div className="card analytics-card">
        <h2 className="analytics-card-h2">Recent Generations</h2>
        {recentActivity.length === 0 ? (
          <p className="analytics-empty">No generations yet — head to the studio to create something!</p>
        ) : (
          <div className="analytics-recents">
            {recentActivity.map((job) => (
              <div key={job.id} className="analytics-recent-row">
                {job.resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.resultUrl}
                    alt={job.prompt?.slice(0, 50) || 'Generated asset'}
                    width={48}
                    height={48}
                    className="analytics-recent-thumb"
                  />
                ) : (
                  <div className="analytics-recent-thumb analytics-recent-thumb--empty" />
                )}
                <div className="analytics-recent-info">
                  <div className="analytics-recent-prompt">{job.prompt.slice(0, 90)}</div>
                  <div className="analytics-recent-meta">
                    {job.tool} · {job.mode} ·{' '}
                    {new Date(job.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
