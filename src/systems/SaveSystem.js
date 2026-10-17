const STORAGE_KEY = 'shadow_protocol_save_v1';

export const DEFAULT_SAVE_DATA = {
  credits: 0,
  unlockedMissions: 1, // Mission 1 is unlocked initially
  missionRecords: {}, // { [missionId]: { completed: true, stars: 3, bestTime: 45, undetected: true } }
  selectedOperative: 'GHOST',
  unlockedOperatives: ['GHOST'],
  upgrades: {
    speedLevel: 0,      // Max 3 (+10% speed per level)
    decoyCharges: 0,    // Max 2 (+1 charge per level)
    takedownRange: 0    // Max 2 (+8px range per level)
  },
  settings: {
    sfxVolume: 0.7,
    musicVolume: 0.4,
    isMuted: false
  }
};

export class SaveSystem {
  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaults();
      const parsed = JSON.parse(raw);

      // Merge with defaults in case of missing keys
      return {
        ...this.getDefaults(),
        ...parsed,
        upgrades: { ...DEFAULT_SAVE_DATA.upgrades, ...(parsed.upgrades || {}) },
        settings: { ...DEFAULT_SAVE_DATA.settings, ...(parsed.settings || {}) },
        missionRecords: { ...(parsed.missionRecords || {}) },
        unlockedOperatives: Array.isArray(parsed.unlockedOperatives) ? parsed.unlockedOperatives : ['GHOST']
      };
    } catch (e) {
      console.warn('Failed to parse save data, reverting to defaults:', e);
      return this.getDefaults();
    }
  }

  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game data:', e);
      return false;
    }
  }

  static getDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
  }

  static reset() {
    const defaults = this.getDefaults();
    this.save(defaults);
    return defaults;
  }
}
