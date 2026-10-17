import Phaser from 'phaser';
import { AssetGenerator } from '../assets/AssetGenerator.js';
import { Collectible } from '../entities/Collectible.js';
import { Decoy } from '../entities/Decoy.js';
import { Guard } from '../entities/Guard.js';
import { GUARD_STATES, TILE_SIZE, OPERATIVE_TYPES } from '../utils/Constants.js';
import { LevelFactory } from '../levels/LevelFactory.js';
import { MISSIONS } from '../levels/MissionData.js';
import { Pathfinding } from '../systems/Pathfinding.js';
import { Player } from '../entities/Player.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/AudioSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.missionId = data.missionId || 1;
    this.operativeId = data.operativeId || null;
  }

  create() {
    // 1. Generate textures
    if (!this.textures.exists('tile_floor')) {
      AssetGenerator.generateAll(this);
    }

    // 2. Load Save and Operative stats
    this.saveData = SaveSystem.load();
    if (!this.operativeId) {
      this.operativeId = this.saveData.selectedOperative || 'GHOST';
    }

    // 3. Load mission
    const mission = MISSIONS.find(m => m.id === this.missionId) || MISSIONS[0];
    this.mission = mission;

    // 4. Mission Tracking Variables
    this.collectedCredits = 0;
    this.startTime = this.time.now;
    this.alarmsTriggered = 0;
    this.takedowns = 0;
    this.isDecoyTargeting = false;
    this.isGameOver = false;

    // 5. Build Level
    const { collisionGrid, staticObstacles, worldWidth, worldHeight } = LevelFactory.buildLevel(this, {
      width: mission.layout[0].length,
      height: mission.layout.length,
      layout: mission.layout
    });
    this.collisionGrid = collisionGrid;
    this.staticObstacles = staticObstacles;

    // 6. Pathfinding
    this.pathfinding = new Pathfinding(collisionGrid, TILE_SIZE);

    // 7. Spawn Player
    const pSpawnWorld = this.pathfinding.gridToWorld(mission.playerSpawn.gx, mission.playerSpawn.gy);
    this.player = new Player(this, pSpawnWorld.wx, pSpawnWorld.wy, this.operativeId);

    // Apply upgrades
    const upgrades = this.saveData.upgrades || {};
    if (upgrades.speedLevel) {
      this.player.speed += upgrades.speedLevel * 18;
    }
    if (upgrades.decoyCharges) {
      this.player.decoyCharges += upgrades.decoyCharges;
      this.player.maxDecoyCharges += upgrades.decoyCharges;
    }
    if (upgrades.takedownRange) {
      this.player.takedownRange += upgrades.takedownRange * 8;
    }

    this.physics.add.collider(this.player, this.staticObstacles);

    // 8. Spawn Guards
    this.guards = [];
    if (mission.guards) {
      for (const gConfig of mission.guards) {
        const spawnWorld = this.pathfinding.gridToWorld(gConfig.spawn.gx, gConfig.spawn.gy);
        const guard = new Guard(this, {
          ...gConfig,
          worldX: spawnWorld.wx,
          worldY: spawnWorld.wy
        });
        this.physics.add.collider(guard, this.staticObstacles);
        this.guards.push(guard);
      }
    }

    // 9. Spawn Collectibles
    this.collectibles = [];
    if (mission.credits) {
      for (const c of mission.credits) {
        const cWorld = this.pathfinding.gridToWorld(c.gx, c.gy);
        const collectible = new Collectible(this, cWorld.wx, cWorld.wy, c.value);
        this.collectibles.push(collectible);
      }
    }

    // 10. Active Decoy reference
    this.activeDecoy = null;

    // 11. Destination Marker
    this.destMarker = this.add.image(0, 0, 'dest_marker');
    this.destMarker.setVisible(false);
    this.destMarker.setDepth(6);

    // 12. Camera Setup
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.15);

    // 13. Exit zone world coords
    this.exitWorld = this.pathfinding.gridToWorld(mission.exitLocation.gx, mission.exitLocation.gy);

    // 14. Start Audio & HUD Scene
    soundManager.startAmbientDrone();
    this.scene.launch('HUDScene');

    // 15. Setup Input & Events
    this.setupInput();
    this.setupGameEvents();

    // Broadcast initial state
    this.time.delayedCall(100, () => {
      this.updateHUD();
    });
  }

  setupInput() {
    this.input.mouse?.disableContextMenu();

    this.input.on('pointerdown', (pointer) => {
      if (this.isGameOver) return;

      if (pointer.rightButtonDown()) {
        if (this.isDecoyTargeting) {
          this.cancelDecoyMode();
        } else {
          this.cancelMovement();
        }
        return;
      }

      if (pointer.leftButtonDown() || pointer.wasTouch) {
        if (this.isDecoyTargeting) {
          this.deployDecoy(pointer.worldX, pointer.worldY);
        } else {
          // Check if clicked directly on an eligible takedown guard
          const clickedGuard = this.getTakedownTargetAt(pointer.worldX, pointer.worldY);
          if (clickedGuard) {
            this.executeTakedown(clickedGuard);
          } else {
            this.orderMoveTo(pointer.worldX, pointer.worldY);
          }
        }
      }
    });

    // Space key: Takedown if in range, otherwise deploy decoy
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      if (this.isGameOver) return;

      const takedownTarget = this.getNearestTakedownTarget();
      if (takedownTarget) {
        this.executeTakedown(takedownTarget);
      } else {
        this.activateDecoyMode();
      }
    });

    // Escape key: Pause
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      this.pauseGame();
    });
  }

  setupGameEvents() {
    this.events.on('player-reached-destination', () => {
      this.hideDestinationMarker();
    });

    this.events.on('player-killed', () => {
      this.handlePlayerDeath();
    });

    this.events.on('player-health-changed', ({ health, maxHealth }) => {
      soundManager.playPlayerHit();
      this.cameras.main.shake(150, 0.01);
      this.events.emit('hud-update-health', { health, maxHealth });
    });

    this.events.on('guard-alerted', (guard) => {
      this.alarmsTriggered++;
      soundManager.playAlert();

      // Alert other guards within radio range
      for (const other of this.guards) {
        if (other !== guard && other.state !== GUARD_STATES.DEFEATED && other.state !== GUARD_STATES.ALERT) {
          const dist = Phaser.Math.Distance.Between(guard.x, guard.y, other.x, other.y);
          if (dist < 260) {
            other.lastKnownPlayerPos = { x: this.player.x, y: this.player.y };
            other.setState(GUARD_STATES.ALERT);
          }
        }
      }
    });

    this.events.on('guard-defeated', ({ guard, x, y }) => {
      this.takedowns++;

      // Drop a collectible credit
      const chip = new Collectible(this, x, y, 50);
      this.collectibles.push(chip);

      this.updateHUD();
    });

    this.events.on('decoy-expired', () => {
      this.activeDecoy = null;
    });
  }

  updateHUD() {
    const aliveGuards = this.guards.filter(g => g.state !== GUARD_STATES.DEFEATED).length;
    this.events.emit('hud-update-targets', {
      remaining: aliveGuards,
      total: this.guards.length
    });

    this.events.emit('hud-update-credits', this.collectedCredits);
    this.events.emit('hud-update-decoy', {
      charges: this.player.decoyCharges,
      maxCharges: this.player.maxDecoyCharges
    });
    this.events.emit('hud-update-health', {
      health: this.player.health,
      maxHealth: this.player.maxHealth
    });
  }

  orderMoveTo(worldX, worldY) {
    if (!this.player || this.player.isDead) return;

    const startGrid = this.pathfinding.worldToGrid(this.player.x, this.player.y);
    const targetGrid = this.pathfinding.worldToGrid(worldX, worldY);

    const calculatedPath = this.pathfinding.findPath(
      startGrid.gx,
      startGrid.gy,
      targetGrid.gx,
      targetGrid.gy
    );

    if (calculatedPath && calculatedPath.length > 0) {
      this.player.setPath(calculatedPath);
      const finalPoint = calculatedPath[calculatedPath.length - 1];
      this.showDestinationMarker(finalPoint.wx, finalPoint.wy);
    }
  }

  cancelMovement() {
    if (!this.player) return;
    this.player.stop();
    this.hideDestinationMarker();
  }

  showDestinationMarker(wx, wy) {
    this.destMarker.setPosition(wx, wy);
    this.destMarker.setVisible(true);
    this.destMarker.setScale(0.5);
    this.destMarker.setAlpha(1);

    this.tweens.killTweensOf(this.destMarker);
    this.tweens.add({
      targets: this.destMarker,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  hideDestinationMarker() {
    if (!this.destMarker.visible) return;
    this.tweens.add({
      targets: this.destMarker,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 150,
      onComplete: () => {
        this.destMarker.setVisible(false);
      }
    });
  }

  getTakedownTargetAt(worldX, worldY) {
    for (const guard of this.guards) {
      if (guard.state === GUARD_STATES.DEFEATED) continue;
      const dist = Phaser.Math.Distance.Between(worldX, worldY, guard.x, guard.y);
      if (dist < 32 && guard.checkTakedownEligibility(this.player, this.collisionGrid)) {
        return guard;
      }
    }
    return null;
  }

  getNearestTakedownTarget() {
    for (const guard of this.guards) {
      if (guard.state === GUARD_STATES.DEFEATED) continue;
      if (guard.checkTakedownEligibility(this.player, this.collisionGrid)) {
        return guard;
      }
    }
    return null;
  }

  executeTakedown(guard) {
    this.player.stop();
    this.hideDestinationMarker();

    // Dash strike towards guard
    const dashX = guard.x - Math.cos(guard.facingAngle) * 20;
    const dashY = guard.y - Math.sin(guard.facingAngle) * 20;

    this.tweens.add({
      targets: this.player,
      x: dashX,
      y: dashY,
      duration: 120,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Takedown sound
        soundManager.playTakedown();

        // Emit spark particles
        this.createTakedownSparks(guard.x, guard.y);

        // Defeat guard
        guard.takeDown();
      }
    });
  }

  createTakedownSparks(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spark = this.add.image(x, y, 'spark');
      spark.setDepth(y + 20);

      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 35,
        y: y + Math.sin(angle) * 35,
        scaleX: 0.2,
        scaleY: 0.2,
        alpha: 0,
        duration: 250,
        onComplete: () => spark.destroy()
      });
    }
  }

  activateDecoyMode() {
    if (!this.player || this.player.decoyCharges <= 0 || this.activeDecoy) return;
    this.isDecoyTargeting = true;
    soundManager.playClick();
  }

  cancelDecoyMode() {
    this.isDecoyTargeting = false;
  }

  deployDecoy(worldX, worldY) {
    this.isDecoyTargeting = false;
    if (this.player.decoyCharges <= 0) return;

    // Check if walkable or near walkable
    const gridPos = this.pathfinding.worldToGrid(worldX, worldY);
    const validGrid = this.pathfinding.findNearestWalkable(gridPos.gx, gridPos.gy);
    if (!validGrid) return;

    const spawn = this.pathfinding.gridToWorld(validGrid.gx, validGrid.gy);

    this.player.decoyCharges--;
    soundManager.playDecoy();

    this.activeDecoy = new Decoy(this, spawn.wx, spawn.wy, this.player.decoyDuration, 280);

    // Attract nearby guards to investigate
    for (const guard of this.guards) {
      if (guard.state !== GUARD_STATES.DEFEATED && guard.state !== GUARD_STATES.ALERT) {
        const dist = Phaser.Math.Distance.Between(spawn.wx, spawn.wy, guard.x, guard.y);
        if (dist <= 280) {
          guard.investigateLocation(spawn.wx, spawn.wy, this.pathfinding);
        }
      }
    }

    this.updateHUD();
  }

  handlePlayerDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.time.delayedCall(1200, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', {
        missionId: this.missionId,
        operativeId: this.operativeId
      });
    });
  }

  checkExitExtraction() {
    if (this.isGameOver) return;

    const aliveGuards = this.guards.filter(g => g.state !== GUARD_STATES.DEFEATED).length;
    if (aliveGuards > 0) return; // Must eliminate targets first

    const distToExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitWorld.wx, this.exitWorld.wy);
    if (distToExit < 36) {
      // Mission Success!
      this.isGameOver = true;
      this.player.stop();

      const elapsedSeconds = (this.time.now - this.startTime) / 1000;

      this.tweens.add({
        targets: this.player,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 500,
        onComplete: () => {
          this.scene.stop('HUDScene');
          this.scene.start('VictoryScene', {
            missionId: this.missionId,
            operativeId: this.operativeId,
            collectedCredits: this.collectedCredits,
            elapsedSeconds,
            takedowns: this.takedowns,
            alarmsTriggered: this.alarmsTriggered
          });
        }
      });
    }
  }

  pauseGame() {
    if (this.isGameOver) return;
    this.scene.pause();
    this.scene.launch('PauseScene', {
      parentScene: 'GameScene',
      missionId: this.missionId
    });
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }

    // Update active decoy
    if (this.activeDecoy) {
      this.activeDecoy.update(delta);
    }

    // Update guards and compute maximum detection
    let maxDetection = 0;
    let anyAlert = false;

    for (const guard of this.guards) {
      guard.update(time, delta, this.player, this.collisionGrid, this.pathfinding);
      if (guard.state === GUARD_STATES.ALERT || guard.state === GUARD_STATES.ATTACK) {
        anyAlert = true;
      }
      if (guard.detectionLevel > maxDetection) {
        maxDetection = guard.detectionLevel;
      }
    }

    // Broadcast stealth status
    this.events.emit('hud-update-stealth', {
      state: anyAlert ? 'ALERT' : 'NORMAL',
      maxDetection
    });

    // Collectibles attraction & pickup
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (!c.isCollected && this.player && !this.player.isDead) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y);
        if (dist < 36) {
          const val = c.collect(this.player);
          if (val > 0) {
            this.collectedCredits += val;
            soundManager.playCredit();
            this.events.emit('hud-update-credits', this.collectedCredits);
          }
          this.collectibles.splice(i, 1);
        }
      }
    }

    // Check extraction victory
    this.checkExitExtraction();
  }
}
