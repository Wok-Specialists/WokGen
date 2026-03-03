// ---------------------------------------------------------------------------
// @/lib/modes.ts
// Single source of truth for WokGen studio modes.
// WokGen is now a dedicated Pixel Art Studio — pixel is the only mode.
// Other studios (vector, brand, UI/UX, voice, code) live at vecto.wokspec.org
// ---------------------------------------------------------------------------

export type ModeId = 'pixel';
export type ModeStatus = 'stable' | 'beta' | 'coming_soon';

export interface ModeContract {
  id: ModeId;
  label: string;
  shortLabel: string;
  accentColor: string;
  status: ModeStatus;
  routes: {
    landing: string;
    studio: string;
    gallery?: string;
    editor?: string;
  };
  models: {
    defaultModelId?: string;
    hdModelId?: string;
  };
}

export const MODES_LIST: ModeContract[] = [
  {
    id: 'pixel',
    label: 'Pixel Art',
    shortLabel: 'Pixel',
    accentColor: '#a78bfa',
    status: 'stable',
    routes: {
      landing: '/pixel',
      studio: '/pixel/studio',
      gallery: '/pixel/gallery',
      editor: '/editor',
    },
    models: { defaultModelId: 'fal-ai/flux/dev', hdModelId: 'fal-ai/flux-pro' },
  },
];

const MODES_MAP = new Map(MODES_LIST.map(m => [m.id, m]));

export function isSupportedMode(mode: unknown): mode is ModeId {
  return typeof mode === 'string' && MODES_MAP.has(mode as ModeId);
}

export function getMode(id: ModeId): ModeContract {
  const mode = MODES_MAP.get(id);
  if (!mode) throw new Error(`Unknown mode: ${id}`);
  return mode;
}
