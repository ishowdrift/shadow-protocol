import Phaser from 'phaser';
import { OPERATIVE_TYPES } from '../utils/Constants.js';
import { soundManager } from '../systems/AudioSystem.js';

export class Player extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} operativeId
   */
  constructor(scene, x, y, operativeId = 'GHOST') {
    super(scene, x, y);

    this.scene = scene;
    const stats = OPERATIVE_TYPES[operativeId] || OPERATIVE_TYPES.GHOST;
    this.operativeId = operativeId;
    this.speed = stats.speed;
    this.maxHealth = stats.maxHealth;
    this.health = this.maxHealth;
    this.takedownRange = stats.takedownRange;
    this.decoyCharges = stats.decoyCharges;
    this.maxDecoyCharges = stats.decoyCharges;
    this.decoyDuration = stats.decoyDuration;

    // Ground shadow
    this.shadow = scene.add.image(0, 10, 'ground_shadow');
    this.shadow.setOrigin(0.5, 0.5);
    this.add(this.shadow);

    // Body sprite
    this.bodySprite = scene.add.sprite(0, 0, 'player_sprite');
    this.bodySprite.setOrigin(0.5, 0.5);
    if (stats.tint && stats.tint !== 0x00f0ff) {
      this.bodySprite.setTint(stats.tint);
    }
    this.add(this.bodySprite);

    // Stealth pulse indicator (subtle breathing animation)
    this.pulseCircle = scene.add.arc(0, 0, 16, 0, 360, false, 0x00f0ff, 0.15);
    this.add(this.pulseCircle);
    scene.tweens.add({
      targets: this.pulseCircle,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0,
      duration: 1200,
      repeat: -1
    });

    // Navigation state
    this.path = [];
    this.currentWaypointIndex = 0;
    this.isMoving = false;
    this.facingAngle = 0; // Radians

    // Combat & invulnerability state
    this.isInvulnerable = false;
    this.isDead = false;

    // Add to scene and set physics
    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.body.setCircle(16, -16, -16);
    this.body.setCollideWorldBounds(true);

    this.updateDepth();
  }

  updateDepth() {
    // 2.5D elevation: objects lower on screen (greater y) render in front of objects higher up
    this.setDepth(this.y + 10);
  }

  setPath(waypoints) {
    if (!waypoints || waypoints.length === 0) {
      this.stop();
      return;
    }

    // Skip the first waypoint if it's identical to current position
    this.path = [...waypoints];
    this.currentWaypointIndex = 0;
    this.isMoving = true;
  }

  stop() {
    this.path = [];
    this.currentWaypointIndex = 0;
    this.isMoving = false;
    if (this.body) {
      this.body.setVelocity(0, 0);
    }
  }

  update(time, delta) {
    if (this.isDead) return;

    this.updateDepth();

    if (!this.isMoving || this.path.length === 0) {
      this.body.setVelocity(0, 0);
      return;
    }

    const target = this.path[this.currentWaypointIndex];
    if (!target) {
      this.stop();
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.wx, target.wy);

    if (dist < 6) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.path.length) {
        // Reached destination!
        this.x = target.wx;
        this.y = target.wy;
        this.stop();
        this.scene.events.emit('player-reached-destination');
        return;
      }
    }

    const currentTarget = this.path[this.currentWaypointIndex];
    const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, currentTarget.wx, currentTarget.wy);

    // Smoothly rotate body toward direction of movement
    this.facingAngle = Phaser.Math.Angle.RotateTo(this.facingAngle, targetAngle, 0.18);
    this.bodySprite.setRotation(this.facingAngle);

    // Move along velocity vector
    const vx = Math.cos(targetAngle) * this.speed;
    const vy = Math.sin(targetAngle) * this.speed;
    this.body.setVelocity(vx, vy);

    // Play tactical footstep
    soundManager.playFootstep();
  }

  takeDamage(amount) {
    if (this.isInvulnerable || this.isDead) return false;

    this.health = Math.max(0, this.health - amount);
    this.scene.events.emit('player-health-changed', { health: this.health, maxHealth: this.maxHealth });

    // Flash red
    this.scene.tweens.add({
      targets: this.bodySprite,
      tint: 0xff0033,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        const stats = OPERATIVE_TYPES[this.operativeId] || OPERATIVE_TYPES.GHOST;
        this.bodySprite.setTint(stats.tint || 0xffffff);
      }
    });

    // Grace period invulnerability
    this.isInvulnerable = true;
    this.scene.time.delayedCall(600, () => {
      this.isInvulnerable = false;
    });

    if (this.health <= 0) {
      this.die();
    }

    return true;
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.stop();

    // Death animation: collapse / fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 400
    });

    this.scene.events.emit('player-killed');
  }
}
