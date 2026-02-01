import { mutateVaultSecurity } from "./vaultSecurity.js";

export function deposit(user, asset, amount) {
  user.onHand[asset] -= amount;

  mutateVaultSecurity(user.vault, () => {
    user.vault[asset] += amount;
  });
}

export function withdraw(user, asset, amount) {
  mutateVaultSecurity(user.vault, () => {
    user.vault[asset] -= amount;
    user.onHand[asset] += amount;
  });
}

export function accessVault(user, amounts) {
  mutateVaultSecurity(user.vault, () => {
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
  });

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
