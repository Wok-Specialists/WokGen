'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wokgen:pixel_gen_history';
const MAX_ENTRIES = 20;

export interface GenHistoryEntry {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

interface Props {
  latestResult?: { id: string; url: string; prompt: string } | null;
  currentResultId?: string | null;
  onSelect: (entry: GenHistoryEntry) => void;
}

function loadHistory(): GenHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GenHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(h: GenHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function GenerationHistory({ latestResult, currentResultId, onSelect }: Props) {
  const [history, setHistory] = useState<GenHistoryEntry[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Append new results to history
  useEffect(() => {
    if (!latestResult?.url || !latestResult.id) return;
    setHistory((prev) => {
      // Skip if already the latest entry
      if (prev[0]?.id === latestResult.id) return prev;
      const filtered = prev.filter((e) => e.id !== latestResult.id);
      const next = [
        { id: latestResult.id, url: latestResult.url, prompt: latestResult.prompt, createdAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, [latestResult?.id, latestResult?.url, latestResult?.prompt]);

  if (history.length === 0) return null;

  return (
    <div className="pixel-studio-history">
      <div className="pixel-studio-history__strip">
        {history.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="pixel-studio-history__thumb"
            style={{
              border: `2px solid ${currentResultId === entry.id ? 'var(--accent)' : 'var(--surface-border)'}`,
              background: currentResultId === entry.id ? 'var(--accent-dim)' : 'var(--surface-overlay)',
            }}
            onClick={() => onSelect(entry)}
            title={entry.prompt}
            aria-label={`History: ${entry.prompt.slice(0, 60)}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.url}
              alt=""
              className="pixel-art"
              style={{
                width: 44,
                height: 44,
                objectFit: 'contain',
                imageRendering: 'pixelated',
                display: 'block',
              }}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
