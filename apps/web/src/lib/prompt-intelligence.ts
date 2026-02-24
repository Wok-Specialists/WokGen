/**
 * WokGen — Prompt Intelligence Engine (Cycle 8)
 *
 * Quality classifier + auto-enrichment with diff tracking.
 * Used by studio UIs to show users what was added to their prompt.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PromptQuality = 1 | 2 | 3; // 1=minimal, 2=average, 3=rich

export interface EnrichmentAddition {
  text: string;
  reason: string;
}

export interface PromptAnalysis {
  quality: PromptQuality;
  additions: EnrichmentAddition[];
  enriched: string;
  wordCount: number;
}

// ---------------------------------------------------------------------------
// Quality classification
// ---------------------------------------------------------------------------

export function classifyPromptQuality(prompt: string, mode: string): PromptQuality {
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  const wc = words.length;

  if (wc < 5) return 1;

  const text = prompt.toLowerCase();

  // Check for composition/style indicators
  const hasStyle = /style|aesthetic|palette|color|theme|mood|tone|flat|3d|isometric|realistic|cartoon|minimal|bold|clean|dark|light/.test(text);
  const hasTechnical = /\d+(x|\s*by\s*)\d+|transparent|background|vector|svg|aspect|resolution|format|component|layout|wireframe/.test(text);
  const hasPurpose = /for|used in|game|brand|logo|banner|icon|app|website|social|marketing|ad|post|product|cover|title|header|hero|landing|ui|component/.test(text);

  const signals = [hasStyle, hasTechnical, hasPurpose].filter(Boolean).length;

  if (wc >= 10 && signals >= 2) return 3;
  if (wc >= 5 && signals >= 1) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Mode-specific enrichers
// ---------------------------------------------------------------------------

const MODE_ENRICHERS: Record<string, (prompt: string) => EnrichmentAddition[]> = {
  pixel: (prompt) => {
    const additions: EnrichmentAddition[] = [];
    const t = prompt.toLowerCase();
    if (!/\d+(x|\s*by\s*)\d+/.test(t) && !/size|resolution/.test(t)) {
      additions.push({ text: 'pixel art style', reason: 'Added art style for clarity' });
    }
    if (!/palette|color|bit/.test(t)) {
      additions.push({ text: '16-bit palette', reason: 'Added palette spec for consistent output' });
    }
    if (!/transparent|background/.test(t)) {
      additions.push({ text: 'transparent background', reason: 'Transparent bg is standard for game assets' });
    }
    return additions;
  },

  business: (prompt) => {
    const additions: EnrichmentAddition[] = [];
    const t = prompt.toLowerCase();
    if (!/aspect|ratio|format|\d+:\d+|square|landscape|portrait/.test(t)) {
      additions.push({ text: 'professional business design', reason: 'Added format guidance' });
    }
    if (!/clean|minimal|bold|modern|corporate/.test(t)) {
      additions.push({ text: 'clean modern style', reason: 'Added visual style direction' });
    }
    return additions;
  },

  vector: (prompt) => {
    const additions: EnrichmentAddition[] = [];
    const t = prompt.toLowerCase();
    if (!/flat|gradient|outlined|filled|line/.test(t)) {
      additions.push({ text: 'flat vector style', reason: 'Added vector style' });
    }
    if (!/color|palette/.test(t)) {
      additions.push({ text: 'clean flat colors', reason: 'Added color treatment' });
    }
    if (!/transparent|background/.test(t)) {
      additions.push({ text: 'transparent background', reason: 'Standard for vector assets' });
    }
    return additions;
  },

  uiux: (prompt) => {
    const additions: EnrichmentAddition[] = [];
    const t = prompt.toLowerCase();
    if (!/component|layout|screen|page|modal|form|card|nav|button|input/.test(t)) {
      additions.push({ text: 'UI component', reason: 'Clarified output type' });
    }
    if (!/dark|light|theme/.test(t)) {
      additions.push({ text: 'clean light theme', reason: 'Added theme specification' });
    }
    if (!/react|html|css|tailwind/.test(t)) {
      additions.push({ text: 'React-ready component', reason: 'Added implementation target' });
    }
    return additions;
  },

  voice: (prompt) => {
    const additions: EnrichmentAddition[] = [];
    const t = prompt.toLowerCase();
    if (!/tone|formal|casual|confident|warm|neutral|professional|energetic/.test(t)) {
      additions.push({ text: 'professional confident tone', reason: 'Added delivery tone' });
    }
    if (!/pace|speed|slow|fast|measured/.test(t)) {
      additions.push({ text: 'measured pace', reason: 'Added pacing guidance' });
    }
    return additions;
  },

  text: (prompt) => {
    const additions: EnrichmentAddition[] = [];
    const t = prompt.toLowerCase();
    if (!/format|structure|paragraph|bullet|list|header|section/.test(t)) {
      additions.push({ text: 'with clear structure and sections', reason: 'Added output format guidance' });
    }
    if (!/tone|formal|casual|professional|friendly/.test(t)) {
      additions.push({ text: 'professional friendly tone', reason: 'Added tone specification' });
    }
    return additions;
  },
};

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function analyzeAndEnrichPrompt(
  prompt: string,
  mode: string,
  autoEnrich = true,
): PromptAnalysis {
  const quality = classifyPromptQuality(prompt, mode);
  const words = prompt.trim().split(/\s+/).filter(Boolean);

  if (!autoEnrich || quality === 3) {
    return { quality, additions: [], enriched: prompt, wordCount: words.length };
  }

  const enricher = MODE_ENRICHERS[mode];
  if (!enricher) {
    return { quality, additions: [], enriched: prompt, wordCount: words.length };
  }

  const additions = enricher(prompt);

  if (additions.length === 0) {
    return { quality, additions: [], enriched: prompt, wordCount: words.length };
  }

  const suffix = additions.map(a => a.text).join(', ');
  const enriched = `${prompt.trimEnd()}, ${suffix}`;

  return { quality, additions, enriched, wordCount: words.length };
}

// ---------------------------------------------------------------------------
// Quality label helpers
// ---------------------------------------------------------------------------

export function qualityLabel(q: PromptQuality): string {
  return q === 1 ? 'Brief' : q === 2 ? 'Good' : 'Detailed';
}

export function qualityColor(q: PromptQuality): string {
  return q === 1 ? '#ef4444' : q === 2 ? '#f59e0b' : '#22c55e';
}
