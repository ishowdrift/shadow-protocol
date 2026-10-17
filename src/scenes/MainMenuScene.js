import Phaser from 'phaser';
import { AssetGenerator } from '../assets/AssetGenerator.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/AudioSystem.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    // Generate textures if not yet cached
    if (!this.textures.exists('tile_floor')) {
      AssetGenerator.generateAll(this);
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const saveData = SaveSystem.load();

    // 1. Tactical Background with grid pattern
    const bg = this.add.graphics();
    bg.fillStyle(0x060a12, 1);
    bg.fillRect(0, 0, width, height);

    // Subtle ambient background grid lines
    bg.lineStyle(1, 0x101a2e, 0.4);
    for (let x = 0; x < width; x += 48) {
      bg.beginPath(); bg.moveTo(x, 0); bg.lineTo(x, height); bg.strokePath();
    }
    for (let y = 0; y < height; y += 48) {
      bg.beginPath(); bg.moveTo(0, y); bg.lineTo(width, y); bg.strokePath();
    }

    // 2. Title Branding
    const title = this.add.text(width / 2, 140, 'SHADOW // PROTOCOL', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#00f0ff',
      shadow: { blur: 18, color: '#00f0ff', fill: true }
    }).setOrigin(0.5);

    this.add.text(width / 2, 185, 'TACTICAL STEALTH ASSASSINATION // 2.5D SURVEILLANCE MATRIX', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#8899aa',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Operative Status Bar
    this.add.text(width / 2, 230, `ACTIVE OPERATIVE: ${saveData.selectedOperative}  |  SECURITY CREDITS: $${saveData.credits || 0}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#ffb700',
      backgroundColor: 'rgba(10, 20, 35, 0.75)',
      padding: { x: 14, y: 6 }
    }).setOrigin(0.5);

    // 3. Menu Buttons
    const startY = 290;
    const spacing = 55;

    this.createMenuButton(width / 2, startY, 'DEPLOY MISSION', 0x00f0ff, () => {
      soundManager.playClick();
      this.scene.start('GameScene', { missionId: saveData.unlockedMissions || 1 });
    });

    this.createMenuButton(width / 2, startY + spacing, 'MISSION ARCHIVES', 0x38bdf8, () => {
      soundManager.playClick();
      this.scene.start('MissionSelectScene');
    });

    this.createMenuButton(width / 2, startY + spacing * 2, 'OPERATIVE ARMORY & UPGRADES', 0xf59e0b, () => {
      soundManager.playClick();
      this.scene.start('UpgradesScene');
    });

    this.createMenuButton(width / 2, startY + spacing * 3, 'SETTINGS & CONTROLS', 0x64748b, () => {
      soundManager.playClick();
      this.scene.start('SettingsScene');
    });

    // 4. Footer & Controls info
    this.add.text(width / 2, height - 36, 'CONTROLS: Left-Click Move / Cancel with Right-Click | [SPACE] Takedown / Decoy | [ESC] Pause', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#475569'
    }).setOrigin(0.5);
  }

  createMenuButton(x, y, text, accentColor, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1828, 0.9);
    bg.fillRoundedRect(-170, -20, 340, 40, 4);
    bg.lineStyle(1.5, accentColor, 0.4);
    bg.strokeRoundedRect(-170, -20, 340, 40, 4);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#e2e8f0',
      letterSpacing: 1
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(340, 40);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x182c44, 1);
      bg.fillRoundedRect(-170, -20, 340, 40, 4);
      bg.lineStyle(2, accentColor, 1);
      bg.strokeRoundedRect(-170, -20, 340, 40, 4);
      label.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x0e1828, 0.9);
      bg.fillRoundedRect(-170, -20, 340, 40, 4);
      bg.lineStyle(1.5, accentColor, 0.4);
      bg.strokeRoundedRect(-170, -20, 340, 40, 4);
      label.setColor('#e2e8f0');
    });

    btn.on('pointerdown', callback);
    return btn;
  }
}
