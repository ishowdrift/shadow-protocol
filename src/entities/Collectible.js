import Phaser from 'phaser';

export class Collectible extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} value
   */
  constructor(scene, x, y, value = 50) {
    super(scene, x, y);

    this.scene = scene;
    this.value = value;
    this.isCollected = false;

    // Soft drop shadow
    this.shadow = scene.add.image(0, 8, 'ground_shadow');
    this.shadow.setScale(0.5, 0.4);
    this.shadow.setAlpha(0.4);
    this.add(this.shadow);

    // Glowing chip sprite
    this.chip = scene.add.sprite(0, 0, 'credit_chip');
    this.add(this.chip);

    // Hover tween
    scene.tweens.add({
      targets: this.chip,
      y: -6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Rotation
    scene.tweens.add({
      targets: this.chip,
      scaleX: -1,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    scene.add.existing(this);
    this.setDepth(this.y + 4);
  }

  collect(player) {
    if (this.isCollected) return 0;
    this.isCollected = true;

    // Fly towards player
    this.scene.tweens.killTweensOf(this.chip);
    this.scene.tweens.add({
      targets: this,
      x: player.x,
      y: player.y,
      scaleX: 0.2,
      scaleY: 0.2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });

    return this.value;
  }
}
