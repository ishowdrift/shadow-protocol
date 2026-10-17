import { describe, it, expect } from 'vitest';
import { Pathfinding } from '../src/systems/Pathfinding.js';

describe('Pathfinding System (A*)', () => {
  const tileSize = 48;

  it('finds direct straight line path', () => {
    // 5x5 empty grid (all 0)
    const grid = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const pf = new Pathfinding(grid, tileSize);
    const path = pf.findPath(0, 0, 4, 0);

    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual({ wx: 24, wy: 24 });
    expect(path[path.length - 1]).toEqual({ wx: 4 * 48 + 24, wy: 24 });
  });

  it('navigates around a wall obstacle', () => {
    // Wall blocking direct path from (1, 2) to (3, 2)
    const grid = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const pf = new Pathfinding(grid, tileSize);
    const path = pf.findPath(2, 3, 2, 1);

    expect(path.length).toBeGreaterThan(0);
    // Path must not step on any wall tile
    for (const pt of path) {
      const gx = Math.floor(pt.wx / tileSize);
      const gy = Math.floor(pt.wy / tileSize);
      expect(grid[gy][gx]).toBe(0);
    }
  });

  it('prevents diagonal corner cutting across solid corners', () => {
    // Corner at (1, 0) and (0, 1)
    const grid = [
      [0, 1],
      [1, 0]
    ];
    const pf = new Pathfinding(grid, tileSize);
    const path = pf.findPath(0, 0, 1, 1);
    // Should be impossible to move diagonally between (0,0) and (1,1) because both diagonals are blocked
    expect(path.length).toBe(0);
  });

  it('handles unreachable destinations by finding nearest walkable tile', () => {
    // (2, 2) is a solid wall
    const grid = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ];
    const pf = new Pathfinding(grid, tileSize);
    const path = pf.findPath(0, 0, 1, 1); // targeting the wall tile

    expect(path.length).toBeGreaterThan(0);
    const lastPt = path[path.length - 1];
    const gx = Math.floor(lastPt.wx / tileSize);
    const gy = Math.floor(lastPt.wy / tileSize);
    expect(grid[gy][gx]).toBe(0); // Should stop at adjacent walkable tile
  });
});
