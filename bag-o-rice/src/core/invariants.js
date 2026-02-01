// core/invariants.js
// PURPOSE: Enforce non-negotiable economic laws.
// FAILURE MODE: Throw hard errors. Corruption > downtime.

export function assertNonNegative(value, label) {
  if (value < 0) {
    throw new Error(`Invariant violation: ${label} < 0`);
  }
}

export function assertCapacity(amount, capacity, label) {
  if (amount > capacity) {
    throw new Error(`Invariant violation: ${label} exceeds capacity`);
  }
}

export function assertGoldImmutable(prev, next) {
  if (prev !== next) {
    throw new Error(`Invariant violation: gold mutated illegally`);
  }
}

export function assertKnownEvent(eventName, allowed) {
  if (!allowed.has(eventName)) {
    throw new Error(`Unknown event emitted: ${eventName}`);
  }
}
