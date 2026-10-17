import { TILE_SIZE } from '../utils/Constants.js';

export class Pathfinding {
  /**
   * @param {number[][]} grid 2D array where 0 = walkable, >0 = blocked
   * @param {number} tileSize Size of each tile in world pixels
   */
  constructor(grid, tileSize = TILE_SIZE) {
    this.grid = grid;
    this.height = grid.length;
    this.width = grid[0] ? grid[0].length : 0;
    this.tileSize = tileSize;
  }

  /**
   * Update the collision grid
   * @param {number[][]} grid
   */
  setGrid(grid) {
    this.grid = grid;
    this.height = grid.length;
    this.width = grid[0] ? grid[0].length : 0;
  }

  isWalkable(gx, gy) {
    if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) {
      return false;
    }
    return this.grid[gy][gx] === 0;
  }

  /**
   * Convert world pixel coordinate to grid coordinates
   */
  worldToGrid(wx, wy) {
    return {
      gx: Math.floor(wx / this.tileSize),
      gy: Math.floor(wy / this.tileSize)
    };
  }

  /**
   * Convert grid coordinates to world center coordinates
   */
  gridToWorld(gx, gy) {
    return {
      wx: gx * this.tileSize + this.tileSize / 2,
      wy: gy * this.tileSize + this.tileSize / 2
    };
  }

  /**
   * If clicked tile is blocked, find nearest walkable tile using BFS search
   */
  findNearestWalkable(gx, gy, maxRadius = 8) {
    if (this.isWalkable(gx, gy)) {
      return { gx, gy };
    }

    const queue = [{ gx, gy, dist: 0 }];
    const visited = new Set();
    visited.add(`${gx},${gy}`);

    const directions = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
      { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.dist > maxRadius) break;

      for (const dir of directions) {
        const nx = current.gx + dir.dx;
        const ny = current.gy + dir.dy;
        const key = `${nx},${ny}`;

        if (!visited.has(key)) {
          visited.add(key);
          if (this.isWalkable(nx, ny)) {
            return { gx: nx, gy: ny };
          }
          queue.push({ gx: nx, gy: ny, dist: current.dist + 1 });
        }
      }
    }

    return null;
  }

  /**
   * A* Pathfinding algorithm
   * @param {number} startGx
   * @param {number} startGy
   * @param {number} targetGx
   * @param {number} targetGy
   * @returns {{wx: number, wy: number}[]} Array of world waypoints
   */
  findPath(startGx, startGy, targetGx, targetGy) {
    if (!this.isWalkable(startGx, startGy)) {
      const nearestStart = this.findNearestWalkable(startGx, startGy);
      if (!nearestStart) return [];
      startGx = nearestStart.gx;
      startGy = nearestStart.gy;
    }

    if (!this.isWalkable(targetGx, targetGy)) {
      const nearest = this.findNearestWalkable(targetGx, targetGy);
      if (!nearest) return [];
      targetGx = nearest.gx;
      targetGy = nearest.gy;
    }

    if (startGx === targetGx && startGy === targetGy) {
      return [this.gridToWorld(startGx, startGy)];
    }

    // A* structures
    const openSet = [];
    const closedSet = new Set();
    const gScore = new Map();
    const fScore = new Map();
    const cameFrom = new Map();

    const getKey = (x, y) => `${x},${y}`;
    const startKey = getKey(startGx, startGy);
    const targetKey = getKey(targetGx, targetGy);

    gScore.set(startKey, 0);
    const h = (x1, y1, x2, y2) => {
      const dx = Math.abs(x1 - x2);
      const dy = Math.abs(y1 - y2);
      // Octile distance heuristic
      return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
    };

    fScore.set(startKey, h(startGx, startGy, targetGx, targetGy));
    openSet.push({ gx: startGx, gy: startGy, f: fScore.get(startKey) });

    // 8-directional movement offsets: dx, dy, cost
    const neighbors = [
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: 1, dy: -1, cost: Math.SQRT2 },
      { dx: 1, dy: 1, cost: Math.SQRT2 },
      { dx: -1, dy: 1, cost: Math.SQRT2 },
      { dx: -1, dy: -1, cost: Math.SQRT2 }
    ];

    while (openSet.length > 0) {
      // Find lowest fScore in openSet
      let lowestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIdx].f) {
          lowestIdx = i;
        }
      }

      const current = openSet.splice(lowestIdx, 1)[0];
      const currentKey = getKey(current.gx, current.gy);

      if (current.gx === targetGx && current.gy === targetGy) {
        // Reconstruct path
        const path = [];
        let curr = currentKey;
        while (curr) {
          const [cx, cy] = curr.split(',').map(Number);
          path.unshift(this.gridToWorld(cx, cy));
          curr = cameFrom.get(curr);
        }
        return path;
      }

      closedSet.add(currentKey);

      for (const offset of neighbors) {
        const nx = current.gx + offset.dx;
        const ny = current.gy + offset.dy;
        const neighborKey = getKey(nx, ny);

        if (closedSet.has(neighborKey)) continue;
        if (!this.isWalkable(nx, ny)) continue;

        // Diagonal corner-cutting check: both adjacent orthogonal tiles must be walkable
        if (offset.dx !== 0 && offset.dy !== 0) {
          if (!this.isWalkable(current.gx + offset.dx, current.gy) ||
              !this.isWalkable(current.gx, current.gy + offset.dy)) {
            continue; // Prevent cutting through solid corners!
          }
        }

        const tentativeG = gScore.get(currentKey) + offset.cost;

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          const f = tentativeG + h(nx, ny, targetGx, targetGy);
          fScore.set(neighborKey, f);

          const existingOpen = openSet.find(n => n.gx === nx && n.gy === ny);
          if (!existingOpen) {
            openSet.push({ gx: nx, gy: ny, f });
          } else {
            existingOpen.f = f;
          }
        }
      }
    }

    // No path found
    return [];
  }
}
