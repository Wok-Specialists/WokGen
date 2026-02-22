/**
 * WokGen Prompt Builder
 * ─────────────────────
 * Centralized, intelligent prompt assembly for every generation call.
 * Aggregates: tool context + style preset + asset category + pixel era +
 * background mode + outline style + palette size → rich, model-tuned prompt.
 */

import type { Tool, StylePreset } from './providers/types';
import { STYLE_PRESET_TOKENS } from './providers/types';

// ---------------------------------------------------------------------------
// Asset Category
// ---------------------------------------------------------------------------
export type AssetCategory =
  | 'weapon'
  | 'armor'
  | 'character'
  | 'monster'
  | 'consumable'
  | 'gem'
  | 'structure'
  | 'nature'
  | 'ui'
  | 'effect'
  | 'tile'
  | 'container'
  | 'portrait'
  | 'vehicle'
  | 'none';

const ASSET_CATEGORY_TOKENS: Record<AssetCategory, string> = {
  weapon:
    'single weapon, game inventory item, centered on frame, no background, iconic silhouette',
  armor:
    'armor piece, game inventory item, centered on frame, metallic texture, iconic silhouette',
  character:
    'game character, full body, centered, consistent proportions, readable at small size',
  monster:
    'creature enemy, full body, menacing silhouette, centered on frame, game sprite',
  consumable:
    'consumable item, glowing aura, centered on frame, readable at 32px, game icon',
  gem:
    'gemstone or material, faceted surfaces, refractive light, centered, no background',
  structure:
    'building or structure, architectural, straight edges, game asset, top-down or side view',
  nature:
    'natural object, organic shape, foliage or terrain, game tile or icon',
  ui:
    'UI element, flat design, clean edges, readable at small size, game HUD component',
  effect:
    'particle effect, magical visual, bright colors, centered, transparent-friendly',
  tile:
    'seamless tile, flat perspective, no visible seams, can tile in all directions, game map tile',
  container:
    'container object, chest or bag, game prop, readable silhouette, centered',
  portrait:
    'character bust portrait, face and upper body, expressive, detailed for size, centered',
  vehicle:
    'vehicle or mount, full body, side view or top-down, game sprite, centered on frame',
  none: '',
};

const ASSET_CATEGORY_NEGATIVES: Record<AssetCategory, string> = {
  weapon: 'multiple weapons, scene background, text, watermark, holder hand',
  armor: 'character wearing it, scene background, multiple pieces, text',
  character: 'multiple characters, text, watermark, busy background, cropped',
  monster: 'multiple monsters, text, watermark, player character',
  consumable: 'multiple items, scene background, hands, text, complex scene',
  gem: 'multiple gems, background scene, hands, text, complex environment',
  structure: 'characters, items, foreground objects cluttering',
  nature: 'characters, monsters, UI elements, text overlay',
  ui: 'characters, background scenes, drop shadows, complex gradients',
  effect: 'solid background, characters, items, text',
  tile: 'characters, items, UI elements, visible tile borders, non-seamless',
  container: 'multiple containers, background scene, contents visible outside',
  portrait: 'full body, multiple characters, background distracting',
  vehicle: 'characters riding it, multiple vehicles, background clutter',
  none: '',
};

// ---------------------------------------------------------------------------
// Pixel Era
// ---------------------------------------------------------------------------
export type PixelEra =
  | 'nes'
  | 'gameboy'
  | 'snes'
  | 'gba'
  | 'modern'
  | 'none';

const PIXEL_ERA_TOKENS: Record<PixelEra, string> = {
  nes:
    '8-bit NES style, 54-color NES palette, chunky pixels, 2x2 pixel blocks, hard color boundaries, no gradients, 1983 era game art',
  gameboy:
    'Game Boy style, 4-shade green monochrome, DMG palette, 160x144 resolution feel, 1989 era, dithering patterns',
  snes:
    '16-bit SNES style, 256-color palette, Mode 7 capable, detailed sprites, 1990 era, rich colors with limited palette',
  gba:
    '32-bit GBA style, rich 15-bit color palette, smooth pixel art, 240x160 resolution feel, 2001 era, detailed backgrounds',
  modern:
    'modern pixel art, HD pixel art, detailed textures, rich shading, contemporary indie game aesthetic',
  none: '',
};

const PIXEL_ERA_NEGATIVES: Record<PixelEra, string> = {
  nes: 'smooth gradients, anti-aliasing, more than 4 colors per sprite, modern shading',
  gameboy: 'color, more than 4 shades, complex gradients, non-green palette',
  snes: 'photorealistic, 3D render, more than 256 colors, flat unshaded',
  gba: 'photorealistic, 3D render, very blocky pixels, 4-color limit',
  modern: 'strict palette limits, very blocky, 8-bit restrictions',
  none: '',
};

// ---------------------------------------------------------------------------
// Background Mode
// ---------------------------------------------------------------------------
export type BackgroundMode = 'transparent' | 'dark' | 'scene';

const BACKGROUND_MODE_TOKENS: Record<BackgroundMode, string> = {
  transparent:
    'transparent background, no background, isolated object, alpha channel, cutout, PNG-ready',
  dark:
    'dark background, atmospheric dark environment, deep shadows, moody lighting',
  scene:
    'environmental context, scene background, immersive setting, contextual environment',
};

// ---------------------------------------------------------------------------
// Outline Style
// ---------------------------------------------------------------------------
export type OutlineStyle = 'bold' | 'soft' | 'none' | 'glow';

const OUTLINE_TOKENS: Record<OutlineStyle, string> = {
  bold: '1px bold black outline, strong contrast outline, defined edges',
  soft: 'subtle soft outline, slight edge definition, smooth boundaries',
  none: 'no outline, borderless, outlineless pixel art',
  glow:
    'luminous glowing outline, neon edge glow, magical aura outline, self-illuminated edges',
};

// ---------------------------------------------------------------------------
// Palette Size
// ---------------------------------------------------------------------------
export type PaletteSize = 4 | 8 | 16 | 32 | 64 | 256;

const PALETTE_TOKENS: Record<number, string> = {
  4: '4-color palette, extremely limited colors, monochromatic range, 2-bit color depth',
  8: '8-color palette, very limited color selection, 3-bit color depth',
  16: '16-color palette, EGA-style color restriction, 4-bit color depth',
  32: '32-color palette, classic game palette, limited but expressive',
  64: '64-color palette, rich selection within limits, 6-bit color depth',
  256: '256-color palette, VGA-style full palette, maximum pixel art detail',
};

// ---------------------------------------------------------------------------
// Per-Tool Expert Prefixes
// ---------------------------------------------------------------------------
const TOOL_PREFIX: Record<Tool, string> = {
  generate:
    'pixel art game asset, crisp pixel edges, clean sprite, game-ready',
  animate:
    'pixel art animation frame, crisp pixel edges, consistent style across frames, game-ready animation',
  rotate:
    'pixel art character turntable, consistent style and palette across views',
  inpaint:
    'pixel art, seamless edit, matching style and palette of surrounding pixels',
  scene:
    'pixel art game scene, cohesive environment, tileable elements, game-ready background',
};

// ---------------------------------------------------------------------------
// Universal Quality Tokens
// ---------------------------------------------------------------------------
const QUALITY_TOKENS =
  'masterful pixel art, no anti-aliasing, clean pixel grid, sharp edges, game-ready asset';

// ---------------------------------------------------------------------------
// Per-Size Tokens (small sizes need different vocabulary than large)
// ---------------------------------------------------------------------------
function getSizeTokens(width: number, height: number): string {
  const maxDim = Math.max(width, height);
  if (maxDim <= 32) {
    return 'extremely readable silhouette at 32px, chunky pixels, minimal detail, iconic shape, no fine detail';
  }
  if (maxDim <= 64) {
    return 'readable at 64px, bold shapes, limited fine detail, strong silhouette';
  }
  if (maxDim <= 128) {
    return 'moderate detail level, clear forms, balanced complexity for 128px';
  }
  if (maxDim <= 256) {
    return 'detailed pixel art, rich textures, complex forms acceptable at 256px';
  }
  return 'highly detailed pixel art, full texture complexity, rich shading for 512px+';
}

// ---------------------------------------------------------------------------
// BuildPromptOptions — full set of params for prompt assembly
// ---------------------------------------------------------------------------
export interface BuildPromptOptions {
  tool: Tool;
  userPrompt: string;
  stylePreset?: StylePreset;
  assetCategory?: AssetCategory;
  pixelEra?: PixelEra;
  backgroundMode?: BackgroundMode;
  outlineStyle?: OutlineStyle;
  paletteSize?: PaletteSize;
  width?: number;
  height?: number;
  /** If true, omit era and heavy quality tokens (for fallback providers) */
  lightweight?: boolean;
}

export interface BuildNegativeOptions {
  assetCategory?: AssetCategory;
  pixelEra?: PixelEra;
  userNegPrompt?: string;
}

// ---------------------------------------------------------------------------
// Main export: buildPrompt
// ---------------------------------------------------------------------------
export function buildPrompt(opts: BuildPromptOptions): string {
  const {
    tool,
    userPrompt,
    stylePreset = 'raw',
    assetCategory = 'none',
    pixelEra = 'none',
    backgroundMode = 'transparent',
    outlineStyle = 'bold',
    paletteSize,
    width = 512,
    height = 512,
    lightweight = false,
  } = opts;

  const parts: string[] = [];

  // 1. Tool prefix
  parts.push(TOOL_PREFIX[tool]);

  // 2. User prompt (always included as-is)
  parts.push(userPrompt.trim());

  // 3. Style preset tokens
  const presetTokens = STYLE_PRESET_TOKENS[stylePreset];
  if (presetTokens) parts.push(presetTokens);

  // 4. Asset category tokens
  const catTokens = ASSET_CATEGORY_TOKENS[assetCategory];
  if (catTokens) parts.push(catTokens);

  // 5. Pixel era tokens (skip for lightweight/pollinations mode)
  if (!lightweight) {
    const eraTokens = PIXEL_ERA_TOKENS[pixelEra];
    if (eraTokens) parts.push(eraTokens);
  }

  // 6. Background mode
  parts.push(BACKGROUND_MODE_TOKENS[backgroundMode]);

  // 7. Outline style
  parts.push(OUTLINE_TOKENS[outlineStyle]);

  // 8. Palette size tokens
  if (paletteSize) {
    const palTokens = PALETTE_TOKENS[paletteSize];
    if (palTokens) parts.push(palTokens);
  }

  // 9. Size-aware detail level tokens
  parts.push(getSizeTokens(width, height));

  // 10. Universal quality tokens (skip lightweight)
  if (!lightweight) {
    parts.push(QUALITY_TOKENS);
  }

  // Deduplicate and join
  return deduplicateTokens(parts).join(', ');
}

// ---------------------------------------------------------------------------
// Main export: buildNegativePrompt
// ---------------------------------------------------------------------------
export function buildNegativePrompt(opts: BuildNegativeOptions): string {
  const { assetCategory = 'none', pixelEra = 'none', userNegPrompt = '' } = opts;

  const parts: string[] = [
    // Universal negatives for pixel art
    'blurry, photorealistic, 3d render, smooth shading, anti-aliased, noisy, grainy',
    'watermark, text, signature, logo, copyright notice',
    'low quality, low resolution, pixelated in a bad way, compression artifacts',
  ];

  // Category-specific negatives
  const catNeg = ASSET_CATEGORY_NEGATIVES[assetCategory];
  if (catNeg) parts.push(catNeg);

  // Era-specific negatives
  const eraNeg = PIXEL_ERA_NEGATIVES[pixelEra];
  if (eraNeg) parts.push(eraNeg);

  // User additions
  if (userNegPrompt.trim()) parts.push(userNegPrompt.trim());

  return deduplicateTokens(parts).join(', ');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split all comma-separated tokens, deduplicate, rejoin */
function deduplicateTokens(parts: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    if (!part.trim()) continue;
    // Split on comma + optional whitespace
    const tokens = part.split(/,\s*/).map((t) => t.trim().toLowerCase());
    for (const token of tokens) {
      if (!token) continue;
      if (!seen.has(token)) {
        seen.add(token);
        result.push(token);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Animation-specific: build per-frame prompt with motion context
// ---------------------------------------------------------------------------
export type AnimationType =
  | 'idle'
  | 'walk'
  | 'run'
  | 'attack'
  | 'cast'
  | 'death'
  | 'fire'
  | 'magic'
  | 'explosion'
  | 'water'
  | 'custom';

interface AnimationFrameSpec {
  description: string;
  totalFrames: number;
  fps: number;
}

const ANIMATION_SPECS: Record<AnimationType, AnimationFrameSpec> = {
  idle:      { description: 'subtle breathing, slight weight shift, hair movement', totalFrames: 6, fps: 8 },
  walk:      { description: 'walking cycle, side view, left-right step progression', totalFrames: 8, fps: 12 },
  run:       { description: 'running cycle, side view, fast leg movement, leaning forward', totalFrames: 6, fps: 18 },
  attack:    { description: 'attack swing cycle: wind up, at apex, follow through, recovery', totalFrames: 5, fps: 12 },
  cast:      { description: 'magic cast: charging stance, energy gathering, release, recoil', totalFrames: 6, fps: 10 },
  death:     { description: 'death animation: stagger, fall, fade out', totalFrames: 6, fps: 8 },
  fire:      { description: 'fire burning loop, flame rising and flickering, looping', totalFrames: 6, fps: 12 },
  magic:     { description: 'magical particle effect, energy burst and fade, looping', totalFrames: 8, fps: 14 },
  explosion: { description: 'explosion: ignition, expansion, dissipation, smoke', totalFrames: 6, fps: 18 },
  water:     { description: 'water ripple cycle, surface disturbance, calm repeat', totalFrames: 4, fps: 8 },
  custom:    { description: 'custom animation sequence', totalFrames: 4, fps: 8 },
};

export function getAnimationSpec(type: AnimationType): AnimationFrameSpec {
  return ANIMATION_SPECS[type];
}

/** Build the prompt for a specific frame in an animation sequence */
export function buildFramePrompt(
  baseOpts: BuildPromptOptions,
  animationType: AnimationType,
  frameIndex: number,
  totalFrames: number,
): string {
  const spec = ANIMATION_SPECS[animationType];
  const frameProgress = Math.round((frameIndex / (totalFrames - 1)) * 100);

  const frameContext = `animation frame ${frameIndex + 1} of ${totalFrames}, ${spec.description}, ${frameProgress}% through animation cycle`;

  return buildPrompt({
    ...baseOpts,
    userPrompt: `${baseOpts.userPrompt}, ${frameContext}`,
  });
}

// ---------------------------------------------------------------------------
// Rotate-specific: per-view direction tokens
// ---------------------------------------------------------------------------
export type ViewDirection = 'front' | 'back' | 'left' | 'right' | 'front_left' | 'front_right' | 'back_left' | 'back_right';

const DIRECTION_TOKENS: Record<ViewDirection, string> = {
  front:        'front-facing view, facing camera, symmetrical, chest and face visible',
  back:         'back view, facing away, rear of character visible',
  left:         'left side view, profile facing left, lateral stance',
  right:        'right side view, profile facing right, lateral stance',
  front_left:   'front-left diagonal, three-quarter view, 45 degrees offset from front',
  front_right:  'front-right diagonal, three-quarter view, 45 degrees offset from front',
  back_left:    'back-left diagonal, three-quarter rear view',
  back_right:   'back-right diagonal, three-quarter rear view',
};

export function buildRotateFramePrompt(
  baseOpts: BuildPromptOptions,
  direction: ViewDirection,
): string {
  return buildPrompt({
    ...baseOpts,
    userPrompt: `${baseOpts.userPrompt}, ${DIRECTION_TOKENS[direction]}`,
  });
}

export const FOUR_DIRECTIONS: ViewDirection[] = ['front', 'right', 'back', 'left'];
export const EIGHT_DIRECTIONS: ViewDirection[] = ['front', 'front_right', 'right', 'back_right', 'back', 'back_left', 'left', 'front_left'];

// Types are already exported as declarations above — no re-export needed.
