import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem, DEFAULT_SAVE_DATA } from '../src/systems/SaveSystem.js';

describe('SaveSystem (Persistence & Fallback)', () => {
  beforeEach(() => {
    // Mock localStorage
    let store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  });

  it('loads defaults if localStorage is empty', () => {
    const data = SaveSystem.load();
    expect(data.credits).toBe(0);
    expect(data.unlockedMissions).toBe(1);
    expect(data.selectedOperative).toBe('GHOST');
    expect(data.unlockedOperatives).toContain('GHOST');
  });

  it('persists and restores saved progress', () => {
    const data = SaveSystem.load();
    data.credits = 350;
    data.unlockedMissions = 3;
    data.unlockedOperatives.push('PHANTOM');
    data.missionRecords[1] = { completed: true, stars: 3, bestTime: 32 };

    SaveSystem.save(data);

    const reloaded = SaveSystem.load();
    expect(reloaded.credits).toBe(350);
    expect(reloaded.unlockedMissions).toBe(3);
    expect(reloaded.unlockedOperatives).toContain('PHANTOM');
    expect(reloaded.missionRecords[1].stars).toBe(3);
  });

  it('safely recovers from corrupted JSON in localStorage', () => {
    localStorage.setItem('shadow_protocol_save_v1', '{invalid_corrupted_json:::');
    const recovered = SaveSystem.load();
    expect(recovered.credits).toBe(0);
    expect(recovered.unlockedMissions).toBe(1);
  });
});
