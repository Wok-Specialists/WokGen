'use client';

/**
 * WokGen — Prompt Intelligence Bar (Cycle 8)
 *
 * Shows quality score and enrichment diff inline below the prompt field.
 * Usage:
 *   <PromptIntelligenceBar prompt={prompt} mode="pixel" onAccept={(enriched) => setPrompt(enriched)} />
 */

import { useState, useEffect } from 'react';
import {
  analyzeAndEnrichPrompt,
  qualityLabel,
  qualityColor,
  type PromptAnalysis,
} from '@/lib/prompt-intelligence';

interface Props {
  prompt: string;
  mode: string;
  onAccept: (enriched: string) => void;
}

export default function PromptIntelligenceBar({ prompt, mode, onAccept }: Props) {
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!prompt.trim()) {
      setAnalysis(null);
      setDismissed(false);
      return;
    }
    const a = analyzeAndEnrichPrompt(prompt, mode, true);
    setAnalysis(a);
    // Reset dismissed if prompt changes significantly
    setDismissed(false);
  }, [prompt, mode]);

  if (!analysis || dismissed) return null;
  const { quality, additions, enriched } = analysis;

  return (
    <div className="prompt-intel-bar" data-quality={quality}>
      <div className="prompt-intel-summary">
        <span
          className="prompt-intel-quality-badge"
          style={{ borderColor: qualityColor(quality), color: qualityColor(quality) }}
        >
          {qualityLabel(quality)}
        </span>

        {additions.length > 0 && (
          <>
            <span className="prompt-intel-hint">
              {additions.length} detail{additions.length !== 1 ? 's' : ''} can be added
            </span>
            <button
              type="button"
              className="prompt-intel-toggle"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
            >
              {open ? 'Hide' : 'Show'}
            </button>
            <button
              type="button"
              className="prompt-intel-accept"
              onClick={() => { onAccept(enriched); setDismissed(true); }}
            >
              Apply
            </button>
          </>
        )}

        <button
          type="button"
          className="prompt-intel-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {open && additions.length > 0 && (
        <ul className="prompt-intel-additions">
          {additions.map((a, i) => (
            <li key={i} className="prompt-intel-addition-item">
              <span className="prompt-intel-addition-text">+ {a.text}</span>
              <span className="prompt-intel-addition-reason">{a.reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
