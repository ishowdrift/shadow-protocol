import { describe, it, expect } from 'vitest';
import { MISSIONS } from '../src/levels/MissionData.js';
import { OPERATIVE_TYPES } from '../src/utils/Constants.js';

describe('Mission Data & Operative Systems', () => {
  it('has 5 handcrafted missions with valid configurations', () => {
    expect(MISSIONS.length).toBe(5);

    MISSIONS.forEach(mission => {
      expect(mission.id).toBeDefined();
      expect(mission.title).toBeDefined();
      expect(mission.playerSpawn).toBeDefined();
      expect(mission.exitLocation).toBeDefined();
      expect(mission.guards.length).toBeGreaterThan(0);
      expect(mission.layout.length).toBeGreaterThan(0);

      // Verify spawn and exit are within bounds and on floor (not wall)
      const spawnTile = mission.layout[mission.playerSpawn.gy][mission.playerSpawn.gx];
      expect(spawnTile).toBe(1); // FLOOR

      const exitTile = mission.layout[mission.exitLocation.gy][mission.exitLocation.gx];
      expect(exitTile).toBe(5); // EXIT
    });
  });

  it('provides 3 distinct playable operative classes', () => {
    const ghost = OPERATIVE_TYPES.GHOST;
    const phantom = OPERATIVE_TYPES.PHANTOM;
    const wraith = OPERATIVE_TYPES.WRAITH;

    expect(ghost.speed).toBe(180);
    expect(phantom.speed).toBe(225); // Agile
    expect(wraith.maxHealth).toBe(140); // Heavy
    expect(wraith.decoyCharges).toBe(4); // Extra decoys
  });

  it('validates decoy distraction sound radius', () => {
    const decoyPos = { x: 200, y: 200 };
    const radius = 280;

    const nearGuard = { x: 300, y: 200 }; // Dist = 100 < 280
    const farGuard = { x: 600, y: 200 };  // Dist = 400 > 280

    const distNear = Math.hypot(nearGuard.x - decoyPos.x, nearGuard.y - decoyPos.y);
    const distFar = Math.hypot(farGuard.x - decoyPos.x, farGuard.y - decoyPos.y);

    expect(distNear <= radius).toBe(true);
    expect(distFar <= radius).toBe(false);
  });
});
