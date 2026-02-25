'use client';

import { useEffect, useState } from 'react';

export function StatBar() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // 1-hour client-side cache via localStorage
    try {
      const cached = localStorage.getItem('wokgen-stat-count');
      if (cached) {
        const { value, ts } = JSON.parse(cached) as { value: number; ts: number };
        if (Date.now() - ts < 3_600_000) { setCount(value); return; }
      }
    } catch { /* ignore */ }

    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then((d: { totalGenerations?: number } | null) => {
        const v = d?.totalGenerations ?? 0;
        setCount(v);
        try { localStorage.setItem('wokgen-stat-count', JSON.stringify({ value: v, ts: Date.now() })); } catch { /* ignore */ }
      })
      .catch(() => setCount(0));
  }, []);

  const display = count === null
    ? '…'
    : count > 0
      ? `${count.toLocaleString()}+ assets generated`
      : 'assets generated every day';

  return (
    <div className="homepage-stat-bar">
      <span>{display}</span>
      <span className="homepage-stat-sep">·</span>
      <span>60+ free tools</span>
      <span className="homepage-stat-sep">·</span>
      <span>WokGen Studio</span>
      <span className="homepage-stat-sep">·</span>
      <span>Open source</span>
    </div>
  );
}
