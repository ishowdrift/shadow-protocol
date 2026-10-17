import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/AudioSystem.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    this.saveData = SaveSystem.load();

    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x060a12, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 60, 'CONFIGURATION & PROTOCOLS', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    // Audio Settings Card
    this.createAudioSettingsCard(width / 2 - 240, 260, 420, 280);

    // Controls Manual Card
    this.createControlsCard(width / 2 + 240, 260, 420, 280);

    // Back to Menu
    this.createBackButton(120, height - 40, () => {
      soundManager.playClick();
      this.scene.start('MainMenuScene');
    });
  }

  createAudioSettingsCard(x, y, w, h) {
    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1726, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, 0x1e3650, 0.6);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    card.add(bg);

    const title = this.add.text(0, -h / 2 + 25, 'AUDIO SYNTHESIZER SETTINGS', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);
    card.add(title);

    // 1. Mute Toggle
    const muteText = this.add.text(-w / 2 + 30, -35, 'MASTER AUDIO:', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#e2e8f0'
    });
    card.add(muteText);

    const muteBtn = this.add.container(w / 2 - 70, -28);
    const muteBg = this.add.graphics();
    const isMuted = soundManager.isMuted;
    muteBg.fillStyle(isMuted ? 0xef4444 : 0x10b981, 0.2);
    muteBg.fillRoundedRect(-40, -14, 80, 28, 4);
    muteBg.lineStyle(1.5, isMuted ? 0xef4444 : 0x10b981, 0.8);
    muteBg.strokeRoundedRect(-40, -14, 80, 28, 4);
    muteBtn.add(muteBg);

    const muteLabel = this.add.text(0, 0, isMuted ? 'MUTED' : 'ACTIVE', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: isMuted ? '#ef4444' : '#10b981'
    }).setOrigin(0.5);
    muteBtn.add(muteLabel);

    muteBtn.setSize(80, 28);
    muteBtn.setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const nextMuted = !soundManager.isMuted;
      soundManager.setMuted(nextMuted);
      this.saveData.settings.isMuted = nextMuted;
      SaveSystem.save(this.saveData);
      this.scene.restart();
    });
    card.add(muteBtn);

    // 2. SFX Test Button
    const sfxBtn = this.add.container(0, 30);
    const sfxBg = this.add.graphics();
    sfxBg.fillStyle(0x00f0ff, 0.15);
    sfxBg.fillRoundedRect(-100, -14, 200, 28, 4);
    sfxBg.lineStyle(1.5, 0x00f0ff, 0.6);
    sfxBg.strokeRoundedRect(-100, -14, 200, 28, 4);
    sfxBtn.add(sfxBg);

    const sfxLabel = this.add.text(0, 0, 'TEST AUDIO CUES', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#00f0ff'
    }).setOrigin(0.5);
    sfxBtn.add(sfxLabel);

    sfxBtn.setSize(200, 28);
    sfxBtn.setInteractive({ useHandCursor: true });
    sfxBtn.on('pointerdown', () => {
      soundManager.playTakedown();
      this.time.delayedCall(300, () => soundManager.playCredit());
    });
    card.add(sfxBtn);

    // 3. Reset Save Data
    const resetBtn = this.add.container(0, 85);
    const resetBg = this.add.graphics();
    resetBg.fillStyle(0xef4444, 0.15);
    resetBg.fillRoundedRect(-100, -14, 200, 28, 4);
    resetBg.lineStyle(1.5, 0xef4444, 0.6);
    resetBg.strokeRoundedRect(-100, -14, 200, 28, 4);
    resetBtn.add(resetBg);

    const resetLabel = this.add.text(0, 0, 'RESET LOCAL SAVE DATA', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#ef4444'
    }).setOrigin(0.5);
    resetBtn.add(resetLabel);

    resetBtn.setSize(200, 28);
    resetBtn.setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      soundManager.playClick();
      SaveSystem.reset();
      this.scene.restart();
    });
    card.add(resetBtn);
  }

  createControlsCard(x, y, w, h) {
    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1726, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, 0x1e3650, 0.6);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    card.add(bg);

    const title = this.add.text(0, -h / 2 + 25, 'TACTICAL PROTOCOL MANUAL', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);
    card.add(title);

    const guideText = this.add.text(-w / 2 + 25, -h / 2 + 65, [
      '• MOVEMENT: Left-click / tap on any floor tile.',
      '• CANCEL ORDER: Right-click anywhere or press [ESC].',
      '• SILENT TAKEDOWN: Approach a guard from behind',
      '  (outside their 75° vision cone) and click the guard',
      '  or press [SPACE].',
      '• SHADOW DECOY: Press [SPACE] when away from guards',
      '  to deploy a decoy that lures sentries away.',
      '• EXTRACTION: Eliminate all targets to unlock the pad.',
      '• DETECTION: Avoid enemy vision cones to earn 3 stars.'
    ], {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#cbd5e1',
      lineSpacing: 8
    });
    card.add(guideText);
  }

  createBackButton(x, y, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1828, 0.9);
    bg.fillRoundedRect(-80, -16, 160, 32, 4);
    bg.lineStyle(1.5, 0x64748b, 0.5);
    bg.strokeRoundedRect(-80, -16, 160, 32, 4);
    btn.add(bg);

    const label = this.add.text(0, 0, '< MAIN MENU', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(160, 32);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', callback);
  }
}
