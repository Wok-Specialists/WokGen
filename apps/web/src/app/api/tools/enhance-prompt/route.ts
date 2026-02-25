// POST { prompt: string, mode: string }
// Returns { enhanced: string }
// Thin wrapper over /api/prompt/enhance — returns first variation as `enhanced`.

export { POST } from '@/app/api/prompt/enhance/route';
