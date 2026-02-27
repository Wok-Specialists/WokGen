'use client';

import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// KeyboardShortcuts — press ? anywhere to see available shortcuts
// ---------------------------------------------------------------------------

const SHORTCUTS = [
  { keys: ['⌘', 'K'],   label: 'Open command palette' },
  { keys: ['?'],         label: 'Show keyboard shortcuts' },
  { keys: ['Esc'],       label: 'Close panel / dismiss' },
  { keys: ['⌘', '↵'],   label: 'Generate / submit' },
];

export default function KeyboardShortcuts() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setShow(s => !s);
      }
      if (e.key === 'Escape') setShow(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="ks-overlay" onClick={() => setShow(false)} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="ks-panel" onClick={e => e.stopPropagation()}>
        <div className="ks-header">
          <span className="ks-title">Keyboard shortcuts</span>
          <button type="button" className="ks-close" onClick={() => setShow(false)} aria-label="Close">×</button>
        </div>
        <ul className="ks-list">
          {SHORTCUTS.map(({ keys, label }) => (
            <li key={label} className="ks-item">
              <span className="ks-label">{label}</span>
              <span className="ks-keys">
                {keys.map((k, i) => (
                  <kbd key={i} className="ks-key">{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="ks-hint">Press <kbd className="ks-key">?</kbd> to toggle</p>
      </div>
    </div>
  );
}
