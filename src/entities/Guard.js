import Phaser from 'phaser';
import { GUARD_STATES, TILE_SIZE } from '../utils/Constants.js';
import { VisionSystem } from '../systems/VisionSystem.js';

export class Guard extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} config
   */
  constructor(scene, config) {
    super(scene, config.worldX, config.worldY);

    this.scene = scene;
    this.guardId = config.id || 'g_' + Math.random().toString(36).substr(2, 5);
    this.patrolNodes = config.patrol || [];
    this.currentPatrolIndex = 0;
    this.patrolWaitTimer = 0;

    // Movement & Combat Stats
    this.patrolSpeed = 75;
    this.alertSpeed = 145;
    this.speed = this.patrolSpeed;
    this.visionRange = 220;
    this.visionFov = 75 * (Math.PI / 180); // 75 degrees in radians
    this.facingAngle = config.facing || 0;
    this.attackRange = 44;
    this.attackCooldown = 0;
    this.attackDamage = 25;

    // State Machine
    this.state = GUARD_STATES.PATROL;
    this.detectionLevel = 0; // 0 to 100
    this.detectionSpeed = 120; // % per second at close range
    this.lastKnownPlayerPos = null;
    this.searchTimer = 0;
    this.searchSweepAngle = 0;
    this.investigateTarget = null;

    // Navigation path
    this.path = [];
    this.currentWaypointIndex = 0;

    // Ground Shadow
    this.shadow = scene.add.image(0, 10, 'ground_shadow');
    this.shadow.setOrigin(0.5, 0.5);
    this.add(this.shadow);

    // Body Sprite
    this.bodySprite = scene.add.sprite(0, 0, 'guard_patrol');
    this.bodySprite.setOrigin(0.5, 0.5);
    this.add(this.bodySprite);

    // Alert Status Icon (floating '?' or '!')
    this.statusText = scene.add.text(0, -28, '', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fbbf24'
    }).setOrigin(0.5);
    this.add(this.statusText);

    // Takedown opportunity prompt ('EXECUTE')
    this.takedownPrompt = scene.add.text(0, 24, '[TAKEDOWN]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#00f0ff',
      backgroundColor: 'rgba(0, 20, 35, 0.85)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    this.takedownPrompt.setVisible(false);
    this.add(this.takedownPrompt);

    // Vision cone graphics
    this.visionGraphics = scene.add.graphics();
    this.visionGraphics.setDepth(3);

    // Enable Physics
    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.body.setCircle(16, -16, -16);

    this.updateDepth();
  }

  updateDepth() {
    this.setDepth(this.y + 8);
  }

  setState(newState) {
    if (this.state === GUARD_STATES.DEFEATED) return;

    this.state = newState;

    switch (newState) {
      case GUARD_STATES.PATROL:
        this.speed = this.patrolSpeed;
        this.bodySprite.setTexture('guard_patrol');
        this.statusText.setText('');
        this.detectionLevel = 0;
        break;

      case GUARD_STATES.SUSPICIOUS:
        this.speed = 0;
        this.body.setVelocity(0, 0);
        this.bodySprite.setTexture('guard_suspicious');
        this.statusText.setText('?');
        this.statusText.setColor('#fbbf24');
        break;

      case GUARD_STATES.INVESTIGATE:
        this.speed = this.patrolSpeed * 1.2;
        this.bodySprite.setTexture('guard_suspicious');
        this.statusText.setText('?');
        this.statusText.setColor('#fbbf24');
        break;

      case GUARD_STATES.ALERT:
      case GUARD_STATES.ATTACK:
        this.speed = this.alertSpeed;
        this.bodySprite.setTexture('guard_alert');
        this.statusText.setText('!');
        this.statusText.setColor('#ef4444');
        this.scene.events.emit('guard-alerted', this);
        break;

      case GUARD_STATES.SEARCH:
        this.speed = 0;
        this.body.setVelocity(0, 0);
        this.searchTimer = 3500; // 3.5s search sweep
        this.bodySprite.setTexture('guard_suspicious');
        this.statusText.setText('SEARCH');
        this.statusText.setColor('#f97316');
        break;

      case GUARD_STATES.RETURN:
        this.speed = this.patrolSpeed;
        this.bodySprite.setTexture('guard_patrol');
        this.statusText.setText('');
        this.resumePatrol();
        break;

      case GUARD_STATES.DEFEATED:
        this.speed = 0;
        this.body.setVelocity(0, 0);
        this.statusText.setText('');
        this.takedownPrompt.setVisible(false);
        this.visionGraphics.clear();
        this.visionGraphics.setVisible(false);
        break;
    }
  }

  setPath(waypoints) {
    this.path = [...waypoints];
    this.currentWaypointIndex = 0;
  }

  followPath() {
    if (!this.path || this.path.length === 0) {
      this.body.setVelocity(0, 0);
      return false;
    }

    const target = this.path[this.currentWaypointIndex];
    if (!target) {
      this.path = [];
      this.body.setVelocity(0, 0);
      return false;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.wx, target.wy);
    if (dist < 8) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.path.length) {
        this.path = [];
        this.body.setVelocity(0, 0);
        return true; // Reached end of path
      }
    }

    const curTarget = this.path[this.currentWaypointIndex];
    const angle = Phaser.Math.Angle.Between(this.x, this.y, curTarget.wx, curTarget.wy);
    this.facingAngle = Phaser.Math.Angle.RotateTo(this.facingAngle, angle, 0.12);
    this.bodySprite.setRotation(this.facingAngle);

    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    this.body.setVelocity(vx, vy);

    return false;
  }

  update(time, delta, player, collisionGrid, pathfinding) {
    if (this.state === GUARD_STATES.DEFEATED) return;

    this.updateDepth();

    // Check line of sight to player
    const canSee = player && !player.isDead && VisionSystem.canSeeTarget(
      this.x, this.y, this.facingAngle, this.visionRange, this.visionFov,
      player.x, player.y, collisionGrid, TILE_SIZE
    );

    // Update detection level
    this.updateDetection(canSee, delta, player);

    // Update State Machine
    switch (this.state) {
      case GUARD_STATES.PATROL:
        this.handlePatrol(delta, pathfinding);
        break;

      case GUARD_STATES.SUSPICIOUS:
        this.handleSuspicious(delta, player);
        break;

      case GUARD_STATES.INVESTIGATE:
        this.handleInvestigate(pathfinding);
        break;

      case GUARD_STATES.ALERT:
      case GUARD_STATES.ATTACK:
        this.handleAttack(delta, player, pathfinding, canSee);
        break;

      case GUARD_STATES.SEARCH:
        this.handleSearch(delta);
        break;

      case GUARD_STATES.RETURN:
        this.handleReturn(pathfinding);
        break;
    }

    // Render Vision Cone
    this.renderVisionCone(collisionGrid);

    // Check stealth takedown eligibility
    this.checkTakedownEligibility(player, collisionGrid);
  }

  updateDetection(canSee, delta, player) {
    if (canSee) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      // Faster detection when closer (1.0 at range, up to 2.5 at point-blank)
      const proximityMult = Phaser.Math.Clamp(1 + (1 - dist / this.visionRange) * 1.5, 1, 2.5);
      this.detectionLevel += (this.detectionSpeed * proximityMult * (delta / 1000));
      this.lastKnownPlayerPos = { x: player.x, y: player.y };

      if (this.detectionLevel >= 100) {
        this.detectionLevel = 100;
        if (this.state !== GUARD_STATES.ALERT && this.state !== GUARD_STATES.ATTACK) {
          this.setState(GUARD_STATES.ALERT);
        }
      } else if (this.detectionLevel > 15 && this.state === GUARD_STATES.PATROL) {
        this.setState(GUARD_STATES.SUSPICIOUS);
      }
    } else {
      // Detection decays if player hidden
      if (this.state === GUARD_STATES.PATROL || this.state === GUARD_STATES.SUSPICIOUS) {
        this.detectionLevel = Math.max(0, this.detectionLevel - (60 * (delta / 1000)));
        if (this.detectionLevel === 0 && this.state === GUARD_STATES.SUSPICIOUS) {
          this.setState(GUARD_STATES.PATROL);
        }
      }
    }
  }

  handlePatrol(delta, pathfinding) {
    if (!this.patrolNodes || this.patrolNodes.length === 0) return;

    if (this.patrolWaitTimer > 0) {
      this.patrolWaitTimer -= delta;
      this.body.setVelocity(0, 0);
      return;
    }

    if (this.path.length === 0) {
      const targetNode = this.patrolNodes[this.currentPatrolIndex];
      const targetWorld = pathfinding.gridToWorld(targetNode.gx, targetNode.gy);
      const startGrid = pathfinding.worldToGrid(this.x, this.y);

      const path = pathfinding.findPath(startGrid.gx, startGrid.gy, targetNode.gx, targetNode.gy);
      if (path && path.length > 0) {
        this.setPath(path);
      } else {
        // Direct move if already adjacent
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolNodes.length;
      }
    }

    const reached = this.followPath();
    if (reached) {
      const currentNode = this.patrolNodes[this.currentPatrolIndex];
      this.patrolWaitTimer = currentNode.waitTime || 1000;
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolNodes.length;
    }
  }

  handleSuspicious(delta, player) {
    // Face towards player
    if (player) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.facingAngle = Phaser.Math.Angle.RotateTo(this.facingAngle, angle, 0.15);
      this.bodySprite.setRotation(this.facingAngle);
    }
  }

  investigateLocation(worldX, worldY, pathfinding) {
    if (this.state === GUARD_STATES.DEFEATED) return;
    this.investigateTarget = { x: worldX, y: worldY };
    this.setState(GUARD_STATES.INVESTIGATE);

    const startGrid = pathfinding.worldToGrid(this.x, this.y);
    const targetGrid = pathfinding.worldToGrid(worldX, worldY);
    const path = pathfinding.findPath(startGrid.gx, startGrid.gy, targetGrid.gx, targetGrid.gy);
    if (path && path.length > 0) {
      this.setPath(path);
    }
  }

  handleInvestigate(pathfinding) {
    const reached = this.followPath();
    if (reached) {
      // Reached investigation target, enter search mode
      this.setState(GUARD_STATES.SEARCH);
    }
  }

  handleAttack(delta, player, pathfinding, canSee) {
    if (!player || player.isDead) {
      this.setState(GUARD_STATES.RETURN);
      return;
    }

    if (canSee) {
      // Has direct sight of player: pursue directly
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.facingAngle = Phaser.Math.Angle.RotateTo(this.facingAngle, angle, 0.2);
      this.bodySprite.setRotation(this.facingAngle);

      if (dist <= this.attackRange) {
        // In melee/shooting range: stop and attack
        this.body.setVelocity(0, 0);
        this.attackCooldown -= delta;
        if (this.attackCooldown <= 0) {
          this.executeAttack(player);
          this.attackCooldown = 800; // Attack every 800ms
        }
      } else {
        // Move toward player
        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;
        this.body.setVelocity(vx, vy);
      }
    } else {
      // Lost sight: move towards last known position
      if (this.lastKnownPlayerPos) {
        const startGrid = pathfinding.worldToGrid(this.x, this.y);
        const targetGrid = pathfinding.worldToGrid(this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y);
        const path = pathfinding.findPath(startGrid.gx, startGrid.gy, targetGrid.gx, targetGrid.gy);
        if (path && path.length > 0) {
          this.setPath(path);
        }
        const reached = this.followPath();
        if (reached) {
          this.lastKnownPlayerPos = null;
          this.setState(GUARD_STATES.SEARCH);
        }
      } else {
        this.setState(GUARD_STATES.SEARCH);
      }
    }
  }

  executeAttack(player) {
    // Attack telegraph animation (lunge)
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 100,
      yoyo: true
    });

    player.takeDamage(this.attackDamage);
    this.scene.events.emit('guard-attacked-player', { guard: this, damage: this.attackDamage });
  }

  handleSearch(delta) {
    this.searchTimer -= delta;

    // Sweep vision cone left and right to search
    this.searchSweepAngle += (delta / 1000) * 3;
    this.facingAngle += Math.sin(this.searchSweepAngle) * 0.05;
    this.bodySprite.setRotation(this.facingAngle);

    if (this.searchTimer <= 0) {
      // Search expired, return to patrol
      this.setState(GUARD_STATES.RETURN);
    }
  }

  resumePatrol() {
    this.detectionLevel = 0;
    this.path = [];
  }

  handleReturn(pathfinding) {
    if (!this.patrolNodes || this.patrolNodes.length === 0) {
      this.setState(GUARD_STATES.PATROL);
      return;
    }

    if (this.path.length === 0) {
      const node = this.patrolNodes[this.currentPatrolIndex];
      const startGrid = pathfinding.worldToGrid(this.x, this.y);
      const path = pathfinding.findPath(startGrid.gx, startGrid.gy, node.gx, node.gy);
      if (path && path.length > 0) {
        this.setPath(path);
      } else {
        this.setState(GUARD_STATES.PATROL);
        return;
      }
    }

    const reached = this.followPath();
    if (reached) {
      this.setState(GUARD_STATES.PATROL);
    }
  }

  renderVisionCone(collisionGrid) {
    this.visionGraphics.clear();
    if (this.state === GUARD_STATES.DEFEATED) return;

    // Choose color and alpha based on state
    let fillColor = 0x3b82f6;
    let fillAlpha = 0.18;
    let strokeColor = 0x60a5fa;

    if (this.state === GUARD_STATES.SUSPICIOUS || this.state === GUARD_STATES.INVESTIGATE) {
      fillColor = 0xf59e0b;
      fillAlpha = 0.28;
      strokeColor = 0xfbbf24;
    } else if (this.state === GUARD_STATES.ALERT || this.state === GUARD_STATES.ATTACK) {
      fillColor = 0xef4444;
      fillAlpha = 0.35;
      strokeColor = 0xf87171;
    } else if (this.state === GUARD_STATES.SEARCH) {
      fillColor = 0xf97316;
      fillAlpha = 0.24;
      strokeColor = 0xfb923c;
    }

    // Compute raycast polygon
    const polygon = VisionSystem.computeVisionPolygon(
      this.x, this.y, this.facingAngle, this.visionRange, this.visionFov,
      collisionGrid, 28, TILE_SIZE
    );

    if (polygon.length > 2) {
      this.visionGraphics.fillStyle(fillColor, fillAlpha);
      this.visionGraphics.beginPath();
      this.visionGraphics.moveTo(polygon[0].x, polygon[0].y);

      for (let i = 1; i < polygon.length; i++) {
        this.visionGraphics.lineTo(polygon[i].x, polygon[i].y);
      }
      this.visionGraphics.closePath();
      this.visionGraphics.fillPath();

      // Outer rim line
      this.visionGraphics.lineStyle(1.5, strokeColor, 0.5);
      this.visionGraphics.beginPath();
      for (let i = 1; i < polygon.length; i++) {
        if (i === 1) this.visionGraphics.moveTo(polygon[i].x, polygon[i].y);
        else this.visionGraphics.lineTo(polygon[i].x, polygon[i].y);
      }
      this.visionGraphics.strokePath();
    }
  }

  checkTakedownEligibility(player, collisionGrid) {
    if (!player || player.isDead || this.state === GUARD_STATES.DEFEATED) {
      this.takedownPrompt.setVisible(false);
      return false;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist > player.takedownRange) {
      this.takedownPrompt.setVisible(false);
      return false;
    }

    // Check angle from guard to player (must be behind guard's facing direction)
    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    let diff = angleToPlayer - this.facingAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    // Behind guard means |diff| > 90 deg (PI/2 rad)
    const isBehind = Math.abs(diff) > Math.PI * 0.5;

    // Check line of sight
    const hasLos = VisionSystem.hasLineOfSight(this.x, this.y, player.x, player.y, collisionGrid, TILE_SIZE);

    const eligible = isBehind && hasLos && (this.state !== GUARD_STATES.ATTACK);
    this.takedownPrompt.setVisible(eligible);
    return eligible;
  }

  takeDown() {
    if (this.state === GUARD_STATES.DEFEATED) return false;

    this.setState(GUARD_STATES.DEFEATED);

    // Defeat animation: scale down and fade out
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.6,
      scaleY: 0.6,
      alpha: 0.3,
      duration: 350,
      onComplete: () => {
        // Drop collectible credit chip
        this.scene.events.emit('guard-defeated', { guard: this, x: this.x, y: this.y });
      }
    });

    return true;
  }
}
