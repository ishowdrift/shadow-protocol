export const TILE_SIZE = 48;

export const TILE_TYPES = {
  EMPTY: 0,
  FLOOR: 1,
  WALL: 2,
  COVER: 3,
  DOOR: 4,
  EXIT: 5
};

export const GUARD_STATES = {
  PATROL: 'PATROL',
  SUSPICIOUS: 'SUSPICIOUS',
  INVESTIGATE: 'INVESTIGATE',
  ALERT: 'ALERT',
  ATTACK: 'ATTACK',
  SEARCH: 'SEARCH',
  RETURN: 'RETURN',
  DEFEATED: 'DEFEATED'
};

export const COLORS = {
  BG: 0x070b12,
  FLOOR: 0x0c1322,
  FLOOR_ALT: 0x0f182b,
  WALL_TOP: 0x1b283d,
  WALL_FRONT: 0x111a28,
  WALL_BORDER: 0x00f0ff,
  PLAYER: 0x00f0ff,
  GUARD_PATROL: 0x3b82f6,
  GUARD_SUSPICIOUS: 0xf59e0b,
  GUARD_ALERT: 0xef4444,
  CONE_PATROL: 0x3b82f6,
  CONE_SUSPICIOUS: 0xf59e0b,
  CONE_ALERT: 0xef4444,
  CREDIT: 0xffb700,
  DECOY: 0x00f0ff
};

export const OPERATIVE_TYPES = {
  GHOST: {
    id: 'GHOST',
    name: 'Ghost // Operative',
    description: 'Balanced stealth specialist with standard decoy and sound suppression.',
    speed: 180,
    maxHealth: 100,
    takedownRange: 56,
    decoyCharges: 2,
    decoyDuration: 5000,
    cost: 0,
    tint: 0x00f0ff
  },
  PHANTOM: {
    id: 'PHANTOM',
    name: 'Phantom // Infiltrator',
    description: 'High-agility operative capable of rapid repositioning between cover.',
    speed: 225,
    maxHealth: 80,
    takedownRange: 52,
    decoyCharges: 2,
    decoyDuration: 4000,
    cost: 400,
    tint: 0xa855f7
  },
  WRAITH: {
    id: 'WRAITH',
    name: 'Wraith // Vanguard',
    description: 'Armored heavy operative with expanded decoy charges and enhanced resilience.',
    speed: 165,
    maxHealth: 140,
    takedownRange: 64,
    decoyCharges: 4,
    decoyDuration: 7000,
    cost: 800,
    tint: 0x10b981
  }
};
