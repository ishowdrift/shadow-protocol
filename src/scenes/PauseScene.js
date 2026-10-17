import Phaser from 'phaser';
import { soundManager } from '../systems/AudioSystem.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data) {
    this.parentScene = data.parentScene || 'GameScene';
    this.missionId = data.missionId || 1;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Dark backdrop
    const bg = this.add.graphics();
    bg.fillStyle(0x050912, 0.88);
    bg.fillRect(0, 0, width, height);

    // Modal Box
    const box = this.add.graphics();
    box.fillStyle(0x0b1523, 0.95);
    box.fillRoundedRect(width / 2 - 200, height / 2 - 180, 400, 360, 8);
    box.lineStyle(2, 0x00f0ff, 0.5);
    box.strokeRoundedRect(width / 2 - 200, height / 2 - 180, 400, 360, 8);

    // Title
    this.add.text(width / 2, height / 2 - 140, 'TACTICAL PAUSE', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    // Menu options
    this.createButton(width / 2, height / 2 - 70, 'RESUME MISSION', () => {
      soundManager.playClick();
      this.scene.stop();
      this.scene.resume(this.parentScene);
    });

    this.createButton(width / 2, height / 2 - 10, 'RESTART MISSION', () => {
      soundManager.playClick();
      this.scene.stop();
      this.scene.stop('HUDScene');
      this.scene.start('GameScene', { missionId: this.missionId });
    });

    this.createButton(width / 2, height / 2 + 50, 'MISSION SELECT', () => {
      soundManager.playClick();
      soundManager.stopAmbientDrone();
      this.scene.stop();
      this.scene.stop(this.parentScene);
      this.scene.stop('HUDScene');
      this.scene.start('MissionSelectScene');
    });

    this.createButton(width / 2, height / 2 + 110, 'MAIN MENU', () => {
      soundManager.playClick();
      soundManager.stopAmbientDrone();
      this.scene.stop();
      this.scene.stop(this.parentScene);
      this.scene.stop('HUDScene');
      this.scene.start('MainMenuScene');
    });
  }

  createButton(x, y, text, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x132236, 0.9);
    bg.fillRoundedRect(-140, -20, 280, 40, 4);
    bg.lineStyle(1.5, 0x00f0ff, 0.3);
    bg.strokeRoundedRect(-140, -20, 280, 40, 4);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#e2e8f0'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 40);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x1a3350, 1);
      bg.fillRoundedRect(-140, -20, 280, 40, 4);
      bg.lineStyle(2, 0x00f0ff, 0.9);
      bg.strokeRoundedRect(-140, -20, 280, 40, 4);
      label.setColor('#00f0ff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x132236, 0.9);
      bg.fillRoundedRect(-140, -20, 280, 40, 4);
      bg.lineStyle(1.5, 0x00f0ff, 0.3);
      bg.strokeRoundedRect(-140, -20, 280, 40, 4);
      label.setColor('#e2e8f0');
    });

    btn.on('pointerdown', callback);
    return btn;
  }
}
