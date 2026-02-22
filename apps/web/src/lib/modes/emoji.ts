import type { ModeContract } from './types';

export const emojiMode: ModeContract = {
  id: 'emoji',
  label: 'WokGen Emoji',
  shortLabel: 'Emoji',
  tagline: 'For platforms and apps',
  description: 'Generate custom emoji packs, reaction sets, sticker packs, and app icons.',
  accentColor: '#fb923c',
  outputs: ['image', 'pack'],
  exportFormats: ['png', 'zip'],
  sizeConstraints: { min: 16, max: 256, defaults: [16, 32, 64, 128, 256], defaultSize: 64 },
  tools: [
    { id: 'emoji', label: 'Emoji', description: 'Generate a single emoji or reaction', icon: '😀', outputType: 'image', exportFormats: ['png'] },
    { id: 'pack', label: 'Pack Builder', description: 'Generate a cohesive emoji pack', icon: '📦', outputType: 'pack', exportFormats: ['png', 'zip'] },
  ],
  presets: [
    { id: 'expressive', label: 'Expressive', tokens: ['expressive emoji', 'high contrast', 'bold features', 'clear emotion'] },
    { id: 'minimal', label: 'Minimal', tokens: ['minimal emoji', 'simple', 'clean lines', 'flat design'] },
    { id: 'blob', label: 'Blob', tokens: ['blob emoji', 'rounded blob shape', 'Discord style', 'soft form'] },
    { id: 'pixel_emoji', label: 'Pixel', tokens: ['pixel emoji', '8-bit emoji', 'pixelated face'] },
  ],
  promptBuilder: 'emoji',
  models: { standardProvider: 'pollinations', hdProvider: 'replicate', hdModelId: 'black-forest-labs/flux-schnell', standardRateLimit: 15, hdCreditsPerGeneration: 1 },
  galleryAspect: 'square',
  galleryFilters: ['tool', 'style', 'platform'],
  licenseKey: 'commercial_app',
  routes: { landing: '/emoji', studio: '/emoji/studio', gallery: '/emoji/gallery', docs: '/docs/emoji' },
  servicePairing: { label: 'WokSpec Emoji Services', description: 'Need custom emoji packs at scale? WokSpec delivers.', href: 'https://wokspec.org' },
  status: 'beta',
  targetUsers: ['Discord server owners', 'App developers', 'Content creators', 'Brand teams'],
  notFor: ['Complex illustrations', 'Pixel game assets', 'Code generation'],
  examplePrompts: [
    { prompt: 'Happy laughing face emoji, yellow blob style', label: 'Happy Blob' },
    { prompt: 'Crying laughing emoji, expressive style', label: 'Cry Laugh' },
  ],
};
