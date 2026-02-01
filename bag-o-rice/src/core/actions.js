// src/core/actions.js

import { now } from "./time.js";
import { emitIntel } from "./intel.js";

export function deposit(user, amount) {
  if (user.onHand.rice < amount) throw new Error("INSUFFICIENT_ON_HAND");

  user.onHand.rice -= amount;
  user.vault.rice += amount;

  emitIntel(user, {
    source: "deposit",
    snapshot: {
      vaultRice: user.vault.rice,
      security: user.vault.security
    }
  });

  return user;
}

export function withdraw(user, amount) {
  if (user.vault.rice < amount) throw new Error("INSUFFICIENT_VAULT");

  user.vault.rice -= amount;
  user.onHand.rice += amount;

  emitIntel(user, {
    source: "recent_withdrawal",
    snapshot: {
      vaultRice: user.vault.rice,
      security: user.vault.security
    }
  });

  return user;
}

export function tickHunger(user) {
  user.hunger += 1;

  if (user.hunger > 5 && user.onHand.rice > 0) {
    user.onHand.rice -= 1;
    user.hunger -= 2;
  }

  return user;
}
