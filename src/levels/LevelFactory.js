import { TILE_SIZE, TILE_TYPES } from '../utils/Constants.js';

export class LevelFactory {
  /**
   * Builds the 2.5D visual layers and collision grid from level definition
   * @param {Phaser.Scene} scene
   * @param {Object} levelData
   */
  static buildLevel(scene, levelData) {
    const { width, height, layout } = levelData;
    const worldWidth = width * TILE_SIZE;
    const worldHeight = height * TILE_SIZE;

    // Set world physics bounds
    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Collision grid: 0 = walkable, 1 = blocked
    const collisionGrid = Array.from({ length: height }, () => Array(width).fill(0));

    // Walls and cover sprite groups
    const staticObstacles = scene.physics.add.staticGroup();

    // 1. Floor Layer (Depth 0 - 5)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileType = layout[y][x];
        const wx = x * TILE_SIZE + TILE_SIZE / 2;
        const wy = y * TILE_SIZE + TILE_SIZE / 2;

        if (tileType === TILE_TYPES.EXIT) {
          const exitTile = scene.add.image(wx, wy, 'tile_exit');
          exitTile.setDepth(2);
          // Subtle pulse on exit pad
          scene.tweens.add({
            targets: exitTile,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
          });
        } else {
          const floorTile = scene.add.image(wx, wy, 'tile_floor');
          floorTile.setDepth(1);
        }

        // Check if blocked
        if (tileType === TILE_TYPES.WALL) {
          collisionGrid[y][x] = 1;

          // 2.5D Extruded Wall rendering:
          // Top face of wall
          const wallTop = scene.add.image(wx, wy, 'wall_top');
          wallTop.setDepth(wy + 8); // Depth based on vertical plane

          // Front drop extrusion (gives 2.5D architectural height drop below the top face)
          // If the tile below is NOT a wall, render front extrusion
          const tileBelow = y + 1 < height ? layout[y + 1][x] : null;
          if (tileBelow !== TILE_TYPES.WALL) {
            const wallFront = scene.add.image(wx, wy + TILE_SIZE / 2 + 12, 'wall_front');
            wallFront.setDepth(wy + 24);
          }

          // Physics collider body for wall
          const obstacle = staticObstacles.create(wx, wy, null);
          obstacle.setSize(TILE_SIZE, TILE_SIZE);
          obstacle.setVisible(false);
        } else if (tileType === TILE_TYPES.COVER) {
          collisionGrid[y][x] = 1;

          const coverTile = scene.add.image(wx, wy, 'tile_cover');
          coverTile.setDepth(wy + 6);

          const obstacle = staticObstacles.create(wx, wy, null);
          obstacle.setSize(TILE_SIZE - 8, TILE_SIZE - 8);
          obstacle.setVisible(false);
        }
      }
    }

    return {
      collisionGrid,
      staticObstacles,
      worldWidth,
      worldHeight
    };
  }
}
