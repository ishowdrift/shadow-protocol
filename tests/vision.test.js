import { describe, it, expect } from 'vitest';
import { VisionSystem } from '../src/systems/VisionSystem.js';

describe('VisionSystem (Raycasting & FOV)', () => {
  const tileSize = 48;

  it('detects unblocked line of sight', () => {
    // 5x5 empty grid
    const grid = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const canSee = VisionSystem.hasLineOfSight(24, 24, 180, 24, grid, tileSize);
    expect(canSee).toBe(true);
  });

  it('blocks line of sight when a wall intervenes', () => {
    // Wall in middle row: grid[0][2] is wall
    const grid = [
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // Origin at (24, 24), Target at (180, 24) with wall at gx=2 (x=96..144)
    const canSee = VisionSystem.hasLineOfSight(24, 24, 180, 24, grid, tileSize);
    expect(canSee).toBe(false);
  });

  it('ignores targets outside FOV angle', () => {
    const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    // Guard at (24, 24) facing East (0 rad)
    // Target is behind guard at (-50, 24), angle = PI
    const canSee = VisionSystem.canSeeTarget(
      24, 24, 0, 200, 1.3,
      -50, 24, grid, tileSize
    );
    expect(canSee).toBe(false);
  });

  it('ignores targets outside max range', () => {
    const grid = [[0, 0, 0]];
    // Target is in front but 300px away, range is 150px
    const canSee = VisionSystem.canSeeTarget(
      24, 24, 0, 150, 1.3,
      350, 24, grid, tileSize
    );
    expect(canSee).toBe(false);
  });

  it('detects targets within FOV and range with clear LOS', () => {
    const grid = [[0, 0, 0, 0], [0, 0, 0, 0]];
    // Target is directly in front, 80px away
    const canSee = VisionSystem.canSeeTarget(
      24, 24, 0, 200, 1.3,
      104, 24, grid, tileSize
    );
    expect(canSee).toBe(true);
  });
});
