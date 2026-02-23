/**
 * WokGen — Prompt Engine Adapter
 *
 * Thin adapter that routes to the OSS stub or the production engine
 * based on the PROMPT_ENGINE environment variable.
 *
 * PROMPT_ENGINE=oss      → uses packages/prompts/src/stub.ts (OSS quality)
 * PROMPT_ENGINE=wokspec  → uses apps/web/src/lib/prompt-builder.ts (production quality)
 * (default: wokspec in hosted, oss when no internal engine is configured)
 *
 * This is the clean boundary between open-source and proprietary implementations.
 * Both sides expose the same interface — callers don't need to know which is active.
 *
 * Self-hosted users: PROMPT_ENGINE=oss is the right choice. It produces
 * functional pixel art and business prompts using the OSS stub.
 */

import type { PixelEra, AssetCategory, BackgroundMode, OutlineStyle, PaletteSize } from './prompt-builder';
import { buildVariantPrompts } from './variant-builder';

// ---------------------------------------------------------------------------
// Engine selection
// ---------------------------------------------------------------------------

const engine = process.env.PROMPT_ENGINE ?? 'wokspec';

// ---------------------------------------------------------------------------
// Shared interface
// ---------------------------------------------------------------------------

export interface PixelPromptInput {
  tool: string;
  userPrompt: string;
  stylePreset?: string;
  assetCategory?: AssetCategory;
  pixelEra?: PixelEra;
  backgroundMode?: BackgroundMode;
  outlineStyle?: OutlineStyle;
  paletteSize?: PaletteSize;
}

export interface PixelPromptOutput {
  prompt: string;
  negPrompt: string;
}

// ---------------------------------------------------------------------------
// Adapter — routes to OSS stub or production engine
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// PromptConfig / ProcessedPrompt — unified hardening interface (Step 4)
// ---------------------------------------------------------------------------

export interface PromptConfig {
  mode: 'pixel' | 'business' | 'vector' | 'emoji' | 'uiux';
  userPrompt: string;
  style?: string;
  backgroundMode?: 'default' | 'transparent' | 'custom';
  subType?: string; // e.g. 'sprite', 'logo', 'icon'
}

export interface ProcessedPrompt {
  positive: string;
  negative: string;
  guidance: number;
  steps: number;
}

/**
 * Build a hardened, mode-specific prompt configuration.
 *
 * Enforces per-mode style prefixes, negative prompts, guidance scale, and
 * step counts that prevent hallucination and improve consistency.
 */
export function buildPrompt(config: PromptConfig): ProcessedPrompt {
  const { mode, userPrompt, style, backgroundMode, subType } = config;
  const isTransparent = backgroundMode === 'transparent';
  const styleAppend   = style ? `, ${style}` : '';

  switch (mode) {
    case 'pixel': {
      const prefix    = 'pixel art, 8-bit, sprite, crisp pixels, limited palette';
      const bgPos     = isTransparent ? ', transparent background, isolated asset, no background' : '';
      const positive  = `${prefix}, ${userPrompt.trim()}${bgPos}${styleAppend}`;

      const baseNeg   = 'blurry, watermark, text, signature, realistic, 3d, painting, smooth gradients, anti-aliased, photo';
      const bgNeg     = isTransparent ? ', background, gradient background, solid background, textured background' : '';
      const negative  = `${baseNeg}${bgNeg}`;

      return { positive, negative, guidance: 9.0, steps: 25 };
    }

    case 'business': {
      const prefix    = 'professional vector art, clean lines, flat design, brand asset';
      const logoExtra = subType === 'logo' ? ', logo design, symmetric, balanced composition' : '';
      const positive  = `${prefix}, ${userPrompt.trim()}${logoExtra}${styleAppend}`;
      const negative  = 'blurry, noisy, low quality, distorted, watermark, text, messy';
      return { positive, negative, guidance: 7.5, steps: 35 };
    }

    case 'vector': {
      const prefix   = 'clean vector illustration, flat design, SVG style, geometric shapes';
      const positive = `${prefix}, ${userPrompt.trim()}${styleAppend}`;
      const negative = 'photo, realistic, 3d render, noisy, textured, complex gradients';
      return { positive, negative, guidance: 7.5, steps: 30 };
    }

    case 'emoji': {
      const prefix   = 'emoji icon, expressive, bold shape, bright colors, clean design';
      const positive = `${prefix}, ${userPrompt.trim()}${styleAppend}`;
      const negative = 'blurry, complex background, realistic, photo, watermark, text';
      return { positive, negative, guidance: 8.0, steps: 25 };
    }

    case 'uiux': {
      const prefix   = 'clean UI design, modern interface, flat design, professional';
      const positive = `${prefix}, ${userPrompt.trim()}${styleAppend}`;
      const negative = 'low resolution, blurry, sketchy, hand-drawn';
      return { positive, negative, guidance: 8.0, steps: 28 };
    }
  }
}

/**
 * Build N semantically distinct prompt variants for batch generation.
 *
 * Prevents hallucination collapse by mutating the positive prompt per slot:
 *   - Index 0: canonical (unchanged)
 *   - Index 1: different composition angle / pose
 *   - Index 2: different color palette / mood
 *   - Index 3: different detail level / lighting
 *
 * @param base   — Output of buildPrompt for the canonical slot.
 * @param count  — Total variants to produce (including base). Typically 4.
 * @param mode   — Product-line mode for mutation table selection.
 * @param preset — Optional style preset for finer mutation control.
 */
export function batchVariants(
  base: ProcessedPrompt,
  count: number,
  mode: string,
  preset?: string,
): ProcessedPrompt[] {
  const positives = buildVariantPrompts(base.positive, count, mode, preset);
  return positives.map((positive) => ({ ...base, positive }));
}

// ---------------------------------------------------------------------------
// Legacy adapter (kept for backward compat)
// ---------------------------------------------------------------------------

export async function buildPromptAdapter(input: PixelPromptInput): Promise<PixelPromptOutput> {
  if (engine === 'oss') {
    // OSS stub — generic quality, no proprietary token chains
    // OSS stub is in packages/prompts/src/stub.ts
    // Self-hosted: copy stub.ts logic here or reference it via your own import
    return {
      prompt:    [
        'pixel art', 'game asset',
        input.backgroundMode === 'scene' ? 'environmental background' : 'transparent background',
        input.stylePreset,
        input.assetCategory,
        input.userPrompt,
      ].filter(Boolean).join(', '),
      negPrompt: 'blurry, anti-aliased, photorealistic, smooth shading, 3D render, text, watermark, low quality',
    };
  }

  // Production engine (default) — full internal implementation
  const { buildPrompt: pb, buildNegativePrompt } = await import('./prompt-builder');
  return {
    prompt:    pb({
      tool:           input.tool as import('./providers/types').Tool,
      userPrompt:     input.userPrompt,
      stylePreset:    input.stylePreset as import('./providers/types').StylePreset | undefined,
      assetCategory:  input.assetCategory,
      pixelEra:       input.pixelEra,
      backgroundMode: input.backgroundMode,
      outlineStyle:   input.outlineStyle,
      paletteSize:    input.paletteSize,
    }),
    negPrompt: buildNegativePrompt({
      assetCategory: input.assetCategory,
      pixelEra:      input.pixelEra,
    }),
  };
}

