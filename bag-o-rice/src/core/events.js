// core/events.js
// PURPOSE: All state mutation passes through this file.

import { assertKnownEvent } from "./invariants.js";

const handlers = new Map();
const ALLOWED_EVENTS = new Set();

export function registerEvent(eventName, handler) {
  if (handlers.has(eventName)) {
    throw new Error(`Duplicate event handler: ${eventName}`);
  }
  handlers.set(eventName, handler);
  ALLOWED_EVENTS.add(eventName);
}

export function emitEvent(eventName, state, payload, ctx = {}) {
  assertKnownEvent(eventName, ALLOWED_EVENTS);

  const handler = handlers.get(eventName);
  if (!handler) {
    throw new Error(`No handler for event: ${eventName}`);
  }

  const result = handler(state, payload, ctx);

  state.history.push({
    event: eventName,
    payload,
    at: Date.now(),
  });

  return result;
}
// core/vault.js
// PURPOSE: Personal safe-state with access risk.

export function depositToVault(user, amounts) {
  for (const k of ["rice", "cash", "gold"]) {
    const v = amounts[k] || 0;
    if (v > user.onHand[k]) {
      throw new Error("Deposit exceeds on-hand balance");
    }
    user.onHand[k] -= v;
    user.vault[k] += v;
  }

  user.visibility += 1;
  user.vault.access.passExpiresAt = Date.now() + 1000 * 60 * 60;

  return true;
}

export function withdrawFromVault(user, amounts) {
  if (user.vault.access.locked) {
    throw new Error("Vault locked");
  }

  if (user.vault.access.passExpiresAt < Date.now()) {
    throw new Error("Vault access expired");
  }

  for (const k of ["rice", "cash", "gold"]) {
    const v = amounts[k] || 0;
    if (v > user.vault[k]) {
      throw new Error("Withdraw exceeds vault balance");
    }
    user.vault[k] -= v;
    user.onHand[k] += v;
  }

  user.visibility += 2;
  user.vault.security.entropy += 1;

  return true;
}

export function lockVault(user) {
  user.vault.access.locked = true;
}

export function breachVault(user, severity = 1) {
  user.vault.security.integrity -= 0.1 * severity;
  user.vault.security.alarmLevel += severity;

  if (user.vault.security.integrity <= 0) {
    user.vault.access.locked = true;
  }
}
