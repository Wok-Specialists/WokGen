// db/user.schema.js
// PURPOSE: Canonical user state shape for Bag O' Rice

export function createUser(userId) {
  return {
    id: userId,

    posture: "subsistence",
    level: 1,

    onHand: {
      rice: 0,
      cash: 0,
      gold: 0,
    },

    vault: {
      rice: 0,
      cash: 0,
      gold: 0,
      inventory: [],
      security: {
        integrity: 1.0,
        entropy: 0,
        alarmLevel: 0,
      },
      access: {
        passExpiresAt: null,
        locked: false,
      },
    },

    hunger: 0,
    visibility: 0,

    intel: [],
    breachWindows: [],

    history: [],
  };
}
