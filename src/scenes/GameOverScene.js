import Phaser from 'phaser';
import { soundManager } from '../systems/AudioSystem.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.missionId = data.missionId || 1;
    this.operativeId = data.operativeId || 'GHOST';
  }

  create() {
    soundManager.playDefeat();

    const width = this.scale.width;
    const height = this.scale.height;

    // Dark red atmospheric vignette
    const bg = this.add.graphics();
    bg.fillStyle(0x100508, 0.92);
    bg.fillRect(0, 0, width, height);

    // Glitch line
    const box = this.add.graphics();
    box.fillStyle(0x1a0b10, 0.95);
    box.fillRoundedRect(width / 2 - 240, height / 2 - 180, 480, 360, 8);
    box.lineStyle(2, 0xef4444, 0.7);
    box.strokeRoundedRect(width / 2 - 240, height / 2 - 180, 480, 360, 8);

    // Title
    this.add.text(width / 2, height / 2 - 130, 'SIGNAL TERMINATED', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ef4444'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 90, 'OPERATIVE COMPROMISED // MISSION FAILED', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#f87171'
    }).setOrigin(0.5);

    // Tactical Tip
    this.add.text(width / 2, height / 2 - 40, 'TACTICAL INTEL:\nGuards cannot see through solid walls or behind their facing angle.\nDeploy the Shadow Decoy [SPACE] to distract sentries before moving.', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#94a3b8',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);

    // Buttons
    this.createButton(width / 2, height / 2 + 40, 'RETRY MISSION', 0xef4444, () => {
      soundManager.playClick();
      this.scene.start('GameScene', { missionId: this.missionId, operativeId: this.operativeId });
    });

    this.createButton(width / 2, height / 2 + 95, 'MISSION SELECT', 0x00f0ff, () => {
      soundManager.playClick();
      soundManager.stopAmbientDrone();
      this.scene.start('MissionSelectScene');
    });

    this.createButton(width / 2, height / 2 + 145, 'MAIN MENU', 0x64748b, () => {
      soundManager.playClick();
      soundManager.stopAmbientDrone();
      this.scene.start('MainMenuScene');
    });
  }

  createButton(x, y, text, accentColor, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x1e1520, 0.95);
    bg.fillRoundedRect(-140, -18, 280, 36, 4);
    bg.lineStyle(1.5, accentColor, 0.4);
    bg.strokeRoundedRect(-140, -18, 280, 36, 4);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(280, 36);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2d1b28, 1);
      bg.fillRoundedRect(-140, -18, 280, 36, 4);
      bg.lineStyle(2, accentColor, 1);
      bg.strokeRoundedRect(-140, -18, 280, 36, 4);
      label.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1e1520, 0.95);
      bg.fillRoundedRect(-140, -18, 280, 36, 4);
      bg.lineStyle(1.5, accentColor, 0.4);
      bg.strokeRoundedRect(-140, -18, 280, 36, 4);
      label.setColor('#e2e8f0');
    });

    btn.on('pointerdown', callback);
    return btn;
  }
}
