import Phaser from 'phaser';
import { MISSIONS } from '../levels/MissionData.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/AudioSystem.js';

export class MissionSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MissionSelectScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const saveData = SaveSystem.load();

    // Dark grid background
    const bg = this.add.graphics();
    bg.fillStyle(0x060a12, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 50, 'MISSION ARCHIVES // TACTICAL SELECT', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 85, `AVAILABLE CREDITS: $${saveData.credits || 0}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#ffb700'
    }).setOrigin(0.5);

    // Render 5 Mission Cards
    const cardWidth = 220;
    const cardHeight = 380;
    const spacing = 20;
    const totalWidth = 5 * cardWidth + 4 * spacing;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const cardY = 310;

    MISSIONS.forEach((m, idx) => {
      const cx = startX + idx * (cardWidth + spacing);
      const isUnlocked = m.id <= (saveData.unlockedMissions || 1);
      const record = saveData.missionRecords[m.id] || { completed: false, stars: 0, bestTime: null };

      this.createMissionCard(cx, cardY, cardWidth, cardHeight, m, isUnlocked, record, saveData);
    });

    // Back to Menu Button
    this.createBackButton(120, height - 45, () => {
      soundManager.playClick();
      this.scene.start('MainMenuScene');
    });
  }

  createMissionCard(x, y, w, h, mission, isUnlocked, record, saveData) {
    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(isUnlocked ? 0x0c1726 : 0x070c14, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, isUnlocked ? 0x00f0ff : 0x223344, isUnlocked ? 0.5 : 0.3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    card.add(bg);

    // Mission ID & Sector Tag
    const sectorTag = this.add.text(0, -h / 2 + 24, `SECTOR 0${mission.id}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: isUnlocked ? '#00f0ff' : '#475569'
    }).setOrigin(0.5);
    card.add(sectorTag);

    // Mission Title
    const title = this.add.text(0, -h / 2 + 55, mission.title.replace('MISSION 0' + mission.id + ': ', ''), {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: isUnlocked ? '#ffffff' : '#64748b',
      align: 'center',
      wordWrap: { width: w - 24 }
    }).setOrigin(0.5);
    card.add(title);

    // Briefing snippet
    const brief = this.add.text(0, -h / 2 + 120, mission.briefing, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '12px',
      color: isUnlocked ? '#94a3b8' : '#334155',
      align: 'center',
      wordWrap: { width: w - 30 },
      lineSpacing: 2
    }).setOrigin(0.5);
    card.add(brief);

    if (isUnlocked) {
      // Stars Display
      const stars = record.stars || 0;
      const starText = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      const starLabel = this.add.text(0, h / 2 - 130, starText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#fbbf24'
      }).setOrigin(0.5);
      card.add(starLabel);

      // Best Time & Reward
      const statsText = this.add.text(0, h / 2 - 95, `REWARD: $${mission.creditReward}\n${record.bestTime ? 'BEST TIME: ' + record.bestTime + 's' : 'STATUS: UNCLEARED'}`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#38bdf8',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);
      card.add(statsText);

      // Launch Button
      const launchBtn = this.add.container(0, h / 2 - 40);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x00f0ff, 0.15);
      btnBg.fillRoundedRect(-75, -16, 150, 32, 4);
      btnBg.lineStyle(1.5, 0x00f0ff, 0.7);
      btnBg.strokeRoundedRect(-75, -16, 150, 32, 4);
      launchBtn.add(btnBg);

      const btnLabel = this.add.text(0, 0, 'INFILTRATE', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#00f0ff'
      }).setOrigin(0.5);
      launchBtn.add(btnLabel);

      launchBtn.setSize(150, 32);
      launchBtn.setInteractive({ useHandCursor: true });

      launchBtn.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x00f0ff, 0.35);
        btnBg.fillRoundedRect(-75, -16, 150, 32, 4);
        btnBg.lineStyle(2, 0x00f0ff, 1);
        btnBg.strokeRoundedRect(-75, -16, 150, 32, 4);
        btnLabel.setColor('#ffffff');
      });

      launchBtn.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x00f0ff, 0.15);
        btnBg.fillRoundedRect(-75, -16, 150, 32, 4);
        btnBg.lineStyle(1.5, 0x00f0ff, 0.7);
        btnBg.strokeRoundedRect(-75, -16, 150, 32, 4);
        btnLabel.setColor('#00f0ff');
      });

      launchBtn.on('pointerdown', () => {
        soundManager.playClick();
        this.scene.start('GameScene', { missionId: mission.id, operativeId: saveData.selectedOperative });
      });

      card.add(launchBtn);
    } else {
      // Locked Overlay
      const lockLabel = this.add.text(0, h / 2 - 60, 'LOCKED\nCLEAR PRIOR SECTOR', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        color: '#475569',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5);
      card.add(lockLabel);
    }
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
