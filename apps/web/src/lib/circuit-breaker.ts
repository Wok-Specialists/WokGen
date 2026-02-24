/**
 * Circuit breaker pattern for external AI providers.
 * - CLOSED: Normal operation
 * - OPEN: Provider has failed too many times, reject immediately
 * - HALF_OPEN: Tentatively try one request, if success → CLOSED, if fail → OPEN
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface BreakerState {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  successes: number;
}

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 60_000; // 1 minute
const HALF_OPEN_SUCCESSES_NEEDED = 2;

const breakers = new Map<string, BreakerState>();

function getBreaker(name: string): BreakerState {
  if (!breakers.has(name)) {
    breakers.set(name, { state: 'CLOSED', failures: 0, lastFailure: 0, successes: 0 });
  }
  return breakers.get(name)!;
}

export function isCircuitOpen(name: string): boolean {
  const b = getBreaker(name);
  if (b.state === 'OPEN') {
    if (Date.now() - b.lastFailure > RECOVERY_TIMEOUT_MS) {
      b.state = 'HALF_OPEN';
      b.successes = 0;
      return false; // Allow one test request
    }
    return true; // Still open
  }
  return false;
}

export function recordSuccess(name: string): void {
  const b = getBreaker(name);
  if (b.state === 'HALF_OPEN') {
    b.successes += 1;
    if (b.successes >= HALF_OPEN_SUCCESSES_NEEDED) {
      b.state = 'CLOSED';
      b.failures = 0;
    }
  } else {
    b.failures = Math.max(0, b.failures - 1); // Gradual recovery
  }
}

export function recordFailure(name: string): void {
  const b = getBreaker(name);
  b.failures += 1;
  b.lastFailure = Date.now();
  if (b.state === 'HALF_OPEN' || b.failures >= FAILURE_THRESHOLD) {
    b.state = 'OPEN';
  }
}

export function getCircuitStatus(name: string): { state: CircuitState; failures: number; willRetryAt?: number } {
  const b = getBreaker(name);
  return {
    state: b.state,
    failures: b.failures,
    willRetryAt: b.state === 'OPEN' ? b.lastFailure + RECOVERY_TIMEOUT_MS : undefined,
  };
}

export function getAllCircuitStatuses(): Record<string, ReturnType<typeof getCircuitStatus>> {
  const result: Record<string, ReturnType<typeof getCircuitStatus>> = {};
  for (const [name] of breakers) {
    result[name] = getCircuitStatus(name);
  }
  return result;
}

/**
 * Wrap an async provider call with circuit breaker protection.
 * Usage: await withCircuitBreaker('groq', () => callGroq(params))
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>,
): Promise<T> {
  if (isCircuitOpen(name)) {
    if (fallback) return fallback();
    throw new Error(`Circuit breaker OPEN for provider: ${name}. Service temporarily unavailable.`);
  }
  try {
    const result = await fn();
    recordSuccess(name);
    return result;
  } catch (err) {
    recordFailure(name);
    if (fallback) return fallback();
    throw err;
  }
}
