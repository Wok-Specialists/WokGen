// core/intel.js
// PURPOSE: Controlled intel leakage and visibility mechanics

export function leakIntel(targetUser, source = "scan") {
  const intel = {
    id: crypto.randomUUID(),
    source,
    observedAt: Date.now(),
    snapshot: {
      vaultRice: targetUser.vault.rice,
      vaultCash: targetUser.vault.cash,
      security: {
        integrity: targetUser.vault.security.integrity,
        alarmLevel: targetUser.vault.security.alarmLevel,
      },
    },
  };

  targetUser.intel.push(intel);
  targetUser.visibility += 1;

  return intel;
}
