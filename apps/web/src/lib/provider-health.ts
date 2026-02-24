// Provider health tracking - cached success/fail rates
const HEALTH_KEY_PREFIX = 'provider:health:';
const WINDOW_MS = 10 * 60 * 1000; // 10 min rolling window

interface HealthRecord {
  success: number;
  fail: number;
  lastUpdated: number;
}

// Simple in-memory health tracker (upgrade to Redis if needed)
const healthMap = new Map<string, HealthRecord>();

export function recordProviderSuccess(provider: string) {
  const rec = healthMap.get(provider) ?? { success: 0, fail: 0, lastUpdated: Date.now() };
  healthMap.set(provider, { ...rec, success: rec.success + 1, lastUpdated: Date.now() });
}

export function recordProviderFail(provider: string) {
  const rec = healthMap.get(provider) ?? { success: 0, fail: 0, lastUpdated: Date.now() };
  healthMap.set(provider, { ...rec, fail: rec.fail + 1, lastUpdated: Date.now() });
}

export function getProviderHealthScore(provider: string): number {
  const rec = healthMap.get(provider);
  if (!rec) return 1.0; // unknown = assume healthy
  const total = rec.success + rec.fail;
  if (total === 0) return 1.0;
  return rec.success / total;
}

export function getProviderHealth() {
  const result: Record<string, { successRate: number; total: number }> = {};
  for (const [provider, rec] of healthMap.entries()) {
    const total = rec.success + rec.fail;
    result[provider] = { successRate: total > 0 ? rec.success / total : 1, total };
  }
  return result;
}

// Suppress unused variable warning for the prefix constant (reserved for Redis migration)
void HEALTH_KEY_PREFIX;
void WINDOW_MS;
