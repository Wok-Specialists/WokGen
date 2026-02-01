import { VAULT_INVARIANTS } from "./vault.contract.js";

export function applyVaultEntropy(vault) {
  vault.security.entropy += 0.25;

  if (vault.security.entropy > VAULT_INVARIANTS.entropyMax) {
    vault.security.entropy = VAULT_INVARIANTS.entropyMax;
  }

  if (vault.security.entropy < VAULT_INVARIANTS.entropyMin) {
    vault.security.entropy = VAULT_INVARIANTS.entropyMin;
  }
}

export function mutateVaultSecurity(vault, action) {
  if (vault.access.locked) {
    throw new Error("Vault is locked");
  }

  action();

  applyVaultEntropy(vault);

  if (vault.security.entropy >= 1) {
    vault.access.locked = true;
  }
}
