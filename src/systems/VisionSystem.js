import { TILE_SIZE } from '../utils/Constants.js';

export class VisionSystem {
  /**
   * Raycast check between (x1, y1) and (x2, y2) against collision grid
   * Uses fast grid ray marching (Amanatides-Woo / DDA algorithm)
   * @param {number} x1 World X origin
   * @param {number} y1 World Y origin
   * @param {number} x2 World X target
   * @param {number} y2 World Y target
   * @param {number[][]} grid 2D collision grid (0 = walkable, >0 = blocked)
   * @param {number} tileSize
   * @returns {boolean} True if line of sight is clear (unblocked), false if blocked by wall
   */
  static hasLineOfSight(x1, y1, x2, y2, grid, tileSize = TILE_SIZE) {
    const height = grid.length;
    const width = grid[0] ? grid[0].length : 0;

    let gx0 = Math.floor(x1 / tileSize);
    let gy0 = Math.floor(y1 / tileSize);
    const gx1 = Math.floor(x2 / tileSize);
    const gy1 = Math.floor(y2 / tileSize);

    const dx = Math.abs(gx1 - gx0);
    const dy = Math.abs(gy1 - gy0);
    const sx = gx0 < gx1 ? 1 : -1;
    const sy = gy0 < gy1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      // Check if current cell is within bounds and blocked (excluding start and end cells)
      if (gx0 >= 0 && gx0 < width && gy0 >= 0 && gy0 < height) {
        if (grid[gy0][gx0] > 0) {
          // Blocked by wall!
          return false;
        }
      }

      if (gx0 === gx1 && gy0 === gy1) {
        break;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        gx0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        gy0 += sy;
      }
    }

    return true;
  }

  /**
   * Checks whether a target point is within the vision cone arc and line of sight
   * @param {number} originX
   * @param {number} originY
   * @param {number} facingAngle Radians
   * @param {number} range Pixels
   * @param {number} fovAngle Radians (e.g. 75 deg = 1.3 rad)
   * @param {number} targetX
   * @param {number} targetY
   * @param {number[][]} grid
   * @param {number} tileSize
   */
  static canSeeTarget(originX, originY, facingAngle, range, fovAngle, targetX, targetY, grid, tileSize = TILE_SIZE) {
    const dist = Math.hypot(targetX - originX, targetY - originY);
    if (dist > range) {
      return false;
    }

    // Angle from origin to target
    const angleToTarget = Math.atan2(targetY - originY, targetX - originX);

    // Normalize angle difference to [-PI, PI]
    let angleDiff = angleToTarget - facingAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    if (Math.abs(angleDiff) > fovAngle / 2) {
      return false; // Outside cone arc
    }

    // Line of sight raycast
    return this.hasLineOfSight(originX, originY, targetX, targetY, grid, tileSize);
  }

  /**
   * Casts a single ray from origin in given direction until it hits a wall or reaches maxRange
   * Returns hit coordinates { x, y }
   */
  static castRay(originX, originY, angle, maxRange, grid, tileSize = TILE_SIZE) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const stepSize = 12; // Ray sample step in pixels
    let currentDist = stepSize;

    const height = grid.length;
    const width = grid[0] ? grid[0].length : 0;

    while (currentDist <= maxRange) {
      const rx = originX + cos * currentDist;
      const ry = originY + sin * currentDist;

      const gx = Math.floor(rx / tileSize);
      const gy = Math.floor(ry / tileSize);

      if (gx < 0 || gx >= width || gy < 0 || gy >= height || grid[gy][gx] > 0) {
        // Hit boundary or wall
        return { x: rx, y: ry, dist: currentDist, hit: true };
      }

      currentDist += stepSize;
    }

    return {
      x: originX + cos * maxRange,
      y: originY + sin * maxRange,
      dist: maxRange,
      hit: false
    };
  }

  /**
   * Generates polygon vertices for rendering a vision cone with obstacle shadows
   * @param {number} originX
   * @param {number} originY
   * @param {number} facingAngle
   * @param {number} range
   * @param {number} fovAngle
   * @param {number[][]} grid
   * @param {number} numRays
   * @param {number} tileSize
   * @returns {{x: number, y: number}[]}
   */
  static computeVisionPolygon(originX, originY, facingAngle, range, fovAngle, grid, numRays = 28, tileSize = TILE_SIZE) {
    const points = [{ x: originX, y: originY }];
    const halfFov = fovAngle / 2;
    const angleStep = fovAngle / (numRays - 1);

    for (let i = 0; i < numRays; i++) {
      const rayAngle = facingAngle - halfFov + i * angleStep;
      const hitPoint = this.castRay(originX, originY, rayAngle, range, grid, tileSize);
      points.push({ x: hitPoint.x, y: hitPoint.y });
    }

    return points;
  }
}
