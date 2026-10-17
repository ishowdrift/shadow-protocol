import { TILE_SIZE } from '../utils/Constants.js';

export class AssetGenerator {
  /**
   * Generates all procedural textures for the 2.5D aesthetic
   * @param {Phaser.Scene} scene
   */
  static generateAll(scene) {
    this.generateFloorTile(scene);
    this.generateExitTile(scene);
    this.generateWallTextures(scene);
    this.generateCoverTexture(scene);
    this.generatePlayerSprite(scene);
    this.generateGuardSprites(scene);
    this.generateGroundShadow(scene);
    this.generateDestinationMarker(scene);
    this.generateCreditSprite(scene);
    this.generateDecoySprite(scene);
    this.generateParticles(scene);
  }

  static generateFloorTile(scene) {
    const size = TILE_SIZE;
    const canvas = scene.textures.createCanvas('tile_floor', size, size);
    const ctx = canvas.getContext();

    // Base dark navy tile
    ctx.fillStyle = '#0a101b';
    ctx.fillRect(0, 0, size, size);

    // Subtle inner grid panel
    ctx.fillStyle = '#0e1624';
    ctx.fillRect(2, 2, size - 4, size - 4);

    // Seams and bevel
    ctx.strokeStyle = '#152033';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

    // Corner tech rivets
    ctx.fillStyle = '#1c2b42';
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(size - 6, 4, 2, 2);
    ctx.fillRect(4, size - 6, 2, 2);
    ctx.fillRect(size - 6, size - 6, 2, 2);

    canvas.refresh();
  }

  static generateExitTile(scene) {
    const size = TILE_SIZE;
    const canvas = scene.textures.createCanvas('tile_exit', size, size);
    const ctx = canvas.getContext();

    // Floor base
    ctx.fillStyle = '#071624';
    ctx.fillRect(0, 0, size, size);

    // Glowing cyan extraction border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, size - 6, size - 6);

    // Extraction chevron / arrow
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(size / 2, 10);
    ctx.lineTo(size - 12, size - 14);
    ctx.lineTo(size / 2, size - 22);
    ctx.lineTo(12, size - 14);
    ctx.closePath();
    ctx.fill();

    canvas.refresh();
  }

  static generateWallTextures(scene) {
    const size = TILE_SIZE;

    // 1. Wall Top Face (48x48)
    const canvasTop = scene.textures.createCanvas('wall_top', size, size);
    const ctxTop = canvasTop.getContext();

    // Deep slate block
    ctxTop.fillStyle = '#1b2738';
    ctxTop.fillRect(0, 0, size, size);

    // Beveled rim
    ctxTop.fillStyle = '#223247';
    ctxTop.fillRect(2, 2, size - 4, size - 4);

    // High-tech inner pattern
    ctxTop.strokeStyle = '#2b3f5a';
    ctxTop.lineWidth = 1;
    ctxTop.strokeRect(6, 6, size - 12, size - 12);

    // Top highlight rim
    ctxTop.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctxTop.beginPath();
    ctxTop.moveTo(0, 0);
    ctxTop.lineTo(size, 0);
    ctxTop.stroke();

    canvasTop.refresh();

    // 2. Wall Front 2.5D Extrusion Face (48x24)
    // Wall height is 24px drop for the 2.5D architectural elevation
    const canvasFront = scene.textures.createCanvas('wall_front', size, 24);
    const ctxFront = canvasFront.getContext();

    // Vertical gradient showing depth and shadow drop
    const grad = ctxFront.createLinearGradient(0, 0, 0, 24);
    grad.addColorStop(0, '#131c2a');
    grad.addColorStop(1, '#070b12');
    ctxFront.fillStyle = grad;
    ctxFront.fillRect(0, 0, size, 24);

    // Vertical seam lines
    ctxFront.strokeStyle = '#1d2a3f';
    ctxFront.lineWidth = 1;
    ctxFront.beginPath();
    ctxFront.moveTo(12, 0);
    ctxFront.lineTo(12, 24);
    ctxFront.moveTo(36, 0);
    ctxFront.lineTo(36, 24);
    ctxFront.stroke();

    // Bottom shadow contact
    ctxFront.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctxFront.fillRect(0, 20, size, 4);

    canvasFront.refresh();
  }

  static generateCoverTexture(scene) {
    const size = TILE_SIZE;
    const canvas = scene.textures.createCanvas('tile_cover', size, size);
    const ctx = canvas.getContext();

    // Low barrier / server crate
    ctx.fillStyle = '#162333';
    ctx.fillRect(4, 4, size - 8, size - 8);

    // Edge
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, size - 12, size - 12);

    // Hazard stripes
    ctx.fillStyle = 'rgba(255, 153, 0, 0.4)';
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(16, 10);
    ctx.lineTo(10, 16);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(size - 10, size - 10);
    ctx.lineTo(size - 16, size - 10);
    ctx.lineTo(size - 10, size - 16);
    ctx.fill();

    canvas.refresh();
  }

  static generatePlayerSprite(scene) {
    const size = 48;
    const canvas = scene.textures.createCanvas('player_sprite', size, size);
    const ctx = canvas.getContext();
    const cx = size / 2;
    const cy = size / 2;

    // Oriented facing positive X (to the right, angle 0)
    // Tactical assassin body (stealth armor)
    ctx.fillStyle = '#0a1420';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Shoulder pauldrons
    ctx.fillStyle = '#152438';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 10, 5, 0, Math.PI * 2);
    ctx.arc(cx - 3, cy + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Torso outline
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Visor sensor pointing forward (+X)
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - 6);
    ctx.lineTo(cx + 17, cy);
    ctx.lineTo(cx + 8, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Cybernetic spine / battery glow
    ctx.fillStyle = '#00d0e6';
    ctx.fillRect(cx - 10, cy - 2, 7, 4);

    canvas.refresh();
  }

  static generateGuardSprites(scene) {
    // We generate 3 guard textures for distinct alertness visuals:
    // guard_patrol (blue), guard_suspicious (yellow), guard_alert (red)
    const states = [
      { key: 'guard_patrol', color: '#3b82f6', rim: '#60a5fa' },
      { key: 'guard_suspicious', color: '#f59e0b', rim: '#fbbf24' },
      { key: 'guard_alert', color: '#ef4444', rim: '#f87171' }
    ];

    const size = 48;
    const cx = size / 2;
    const cy = size / 2;

    for (const s of states) {
      const canvas = scene.textures.createCanvas(s.key, size, size);
      const ctx = canvas.getContext();

      // Guard armored body
      ctx.fillStyle = '#18202c';
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fill();

      // Armored shoulders
      ctx.fillStyle = '#263445';
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 11, 6, 0, Math.PI * 2);
      ctx.arc(cx - 2, cy + 11, 6, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim
      ctx.strokeStyle = s.rim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Helmet tactical visor
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(cx + 7, cy - 7);
      ctx.lineTo(cx + 17, cy);
      ctx.lineTo(cx + 7, cy + 7);
      ctx.closePath();
      ctx.fill();

      // Tactical rifle muzzle pointing forward
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx + 10, cy + 4, 10, 3);

      canvas.refresh();
    }
  }

  static generateGroundShadow(scene) {
    const w = 44;
    const h = 24;
    const canvas = scene.textures.createCanvas('ground_shadow', w, h);
    const ctx = canvas.getContext();

    // Soft feathered black drop shadow
    const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  static generateDestinationMarker(scene) {
    const size = 36;
    const canvas = scene.textures.createCanvas('dest_marker', size, size);
    const ctx = canvas.getContext();
    const cx = size / 2;
    const cy = size / 2;

    // Outer crosshair brackets
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4 tactical ticks
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy - 12);
    ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, cy + 16);
    ctx.moveTo(cx - 16, cy); ctx.lineTo(cx - 12, cy);
    ctx.moveTo(cx + 12, cy); ctx.lineTo(cx + 16, cy);
    ctx.stroke();

    canvas.refresh();
  }

  static generateCreditSprite(scene) {
    const size = 28;
    const canvas = scene.textures.createCanvas('credit_chip', size, size);
    const ctx = canvas.getContext();
    const cx = size / 2;
    const cy = size / 2;

    // Glowing hexagon security credit chip
    ctx.fillStyle = '#ffb700';
    ctx.strokeStyle = '#fff1a8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * (Math.PI / 180);
      const x = cx + 9 * Math.cos(angle);
      const y = cy + 9 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner tech chip circuitry
    ctx.fillStyle = '#1c1500';
    ctx.fillRect(cx - 3, cy - 3, 6, 6);

    canvas.refresh();
  }

  static generateDecoySprite(scene) {
    const size = 36;
    const canvas = scene.textures.createCanvas('decoy_device', size, size);
    const ctx = canvas.getContext();
    const cx = size / 2;
    const cy = size / 2;

    // Tactical beacon emitter
    ctx.fillStyle = '#0f2b3e';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Pulse core
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  static generateParticles(scene) {
    // 1. Spark particle
    const sparkCanvas = scene.textures.createCanvas('spark', 8, 8);
    const sCtx = sparkCanvas.getContext();
    sCtx.fillStyle = '#00f0ff';
    sCtx.beginPath();
    sCtx.moveTo(4, 0);
    sCtx.lineTo(8, 4);
    sCtx.lineTo(4, 8);
    sCtx.lineTo(0, 4);
    sCtx.closePath();
    sCtx.fill();
    sparkCanvas.refresh();

    // 2. Smoke/poof particle
    const smokeCanvas = scene.textures.createCanvas('smoke', 16, 16);
    const smCtx = smokeCanvas.getContext();
    const grad = smCtx.createRadialGradient(8, 8, 2, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(100, 150, 200, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    smCtx.fillStyle = grad;
    smCtx.beginPath();
    smCtx.arc(8, 8, 8, 0, Math.PI * 2);
    smCtx.fill();
    smokeCanvas.refresh();
  }
}
