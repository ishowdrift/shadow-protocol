import Phaser from 'phaser';

export class Decoy extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} duration Milliseconds
   * @param {number} soundRadius Pixels
   */
  constructor(scene, x, y, duration = 5000, soundRadius = 280) {
    super(scene, x, y);

    this.scene = scene;
    this.duration = duration;
    this.soundRadius = soundRadius;
    this.isExpired = false;

    // Ground shadow
    this.shadow = scene.add.image(0, 8, 'ground_shadow');
    this.shadow.setScale(0.7, 0.5);
    this.add(this.shadow);

    // Decoy device sprite
    this.device = scene.add.sprite(0, 0, 'decoy_device');
    this.add(this.device);

    // Pulse core tween
    scene.tweens.add({
      targets: this.device,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Sound wave graphics
    this.waveGraphics = scene.add.graphics();
    this.waveGraphics.setDepth(4);

    this.waves = [
      { radius: 10, alpha: 0.8 },
      { radius: 60, alpha: 0.5 },
      { radius: 120, alpha: 0.3 }
    ];

    scene.add.existing(this);
    this.setDepth(this.y + 5);

    // Auto-expire timer
    this.timerEvent = scene.time.delayedCall(this.duration, () => {
      this.expire();
    });
  }

  update(delta) {
    if (this.isExpired) return;

    // Expand acoustic rings
    this.waveGraphics.clear();
    const speed = 140; // px/sec

    for (const wave of this.waves) {
      wave.radius += speed * (delta / 1000);
      wave.alpha = Math.max(0, 1 - (wave.radius / this.soundRadius));

      if (wave.radius >= this.soundRadius) {
        wave.radius = 10;
        wave.alpha = 0.8;
      }

      this.waveGraphics.lineStyle(2, 0x00f0ff, wave.alpha * 0.7);
      this.waveGraphics.strokeCircle(this.x, this.y, wave.radius);
    }
  }

  expire() {
    if (this.isExpired) return;
    this.isExpired = true;

    this.waveGraphics.clear();
    this.waveGraphics.destroy();

    // Fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => {
        this.scene.events.emit('decoy-expired', this);
        this.destroy();
      }
    });
  }
}
