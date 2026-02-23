/**
 * API Key authentication helper.
 *
 * Keys are formatted as: wk_live_<32-hex-chars>
 * The raw key is stored only once (shown to user at creation).
 * The DB stores SHA-256(rawKey) as keyHash.
 *
 * Usage in API routes:
 *   const apiAuth = await verifyApiKey(req);
 *   if (!apiAuth) return 401;
 *   // apiAuth.userId, apiAuth.scopes available
 */
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db';

export const KEY_PREFIX = 'wk_live_';

export interface ApiKeyAuth {
  userId: string;
  keyId:  string;
  scopes: string[];
}

/** Generate a new raw API key (call once at creation, never store raw). */
export function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(24).toString('hex');
}

/** Hash a raw key for storage. */
export function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Verify an API key from the Authorization header.
 * Returns null if missing, invalid, revoked, or expired.
 */
export async function verifyApiKey(req: Request): Promise<ApiKeyAuth | null> {
  const header = req.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer wk_live_')) return null;

  const rawKey = header.slice('Bearer '.length);
  const keyHash = hashKey(rawKey);

  const record = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      active: true,
      scopes: true,
      expiresAt: true,
    },
  });

  if (!record || !record.active) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  // Update lastUsedAt asynchronously (don't block the request)
  prisma.apiKey.update({
    where: { id: record.id },
    data:  { lastUsedAt: new Date() },
  }).catch(() => {});

  let scopes: string[] = ['generate'];
  try { scopes = JSON.parse(record.scopes); } catch { /* use default */ }

  return { userId: record.userId, keyId: record.id, scopes };
}
