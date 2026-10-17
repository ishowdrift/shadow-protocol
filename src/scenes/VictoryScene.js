import Phaser from 'phaser';
import { MISSIONS } from '../levels/MissionData.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/AudioSystem.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.missionId = data.missionId || 1;
    this.operativeId = data.operativeId || 'GHOST';
    this.collectedCredits = data.collectedCredits || 0;
    this.elapsedSeconds = data.elapsedSeconds || 45;
    this.takedowns = data.takedowns || 0;
    this.alarmsTriggered = data.alarmsTriggered || 0;
  }

  create() {
    soundManager.playVictory();

    const width = this.scale.width;
    const height = this.scale.height;
    const mission = MISSIONS.find(m => m.id === this.missionId) || MISSIONS[0];

    // Calculate score & rewards
    const isUndetected = this.alarmsTriggered === 0;
    const stealthBonus = isUndetected ? 150 : 0;
    const baseReward = mission.creditReward || 150;
    const totalEarnedCredits = baseReward + this.collectedCredits + stealthBonus;

    // Stars calculation:
    // Star 1: Mission completed
    // Star 2: Undetected
    // Star 3: Under time limit
    let stars = 1;
    if (isUndetected) stars++;
    if (this.elapsedSeconds <= (mission.timeLimit || 90)) stars++;

    // Persist to SaveSystem
    const saveData = SaveSystem.load();
    saveData.credits = (saveData.credits || 0) + totalEarnedCredits;
    saveData.unlockedMissions = Math.max(saveData.unlockedMissions || 1, this.missionId + 1);

    const prevRecord = saveData.missionRecords[this.missionId] || { stars: 0, bestTime: 9999 };
    saveData.missionRecords[this.missionId] = {
      completed: true,
      stars: Math.max(prevRecord.stars || 0, stars),
      bestTime: Math.min(prevRecord.bestTime || 9999, Math.round(this.elapsedSeconds)),
      undetected: prevRecord.undetected || isUndetected
    };

    SaveSystem.save(saveData);

    // Dark high-tech background
    const bg = this.add.graphics();
    bg.fillStyle(0x060c16, 0.94);
    bg.fillRect(0, 0, width, height);

    // Victory Card
    const card = this.add.graphics();
    card.fillStyle(0x0c1726, 0.95);
    card.fillRoundedRect(width / 2 - 260, height / 2 - 210, 520, 420, 8);
    card.lineStyle(2, 0x00f0ff, 0.7);
    card.strokeRoundedRect(width / 2 - 260, height / 2 - 210, 520, 420, 8);

    // Title
    this.add.text(width / 2, height / 2 - 170, 'EXTRACTION CONFIRMED', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 138, `${mission.title} COMPLETED`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#38bdf8'
    }).setOrigin(0.5);

    // Star Icons
    const starString = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    this.add.text(width / 2, height / 2 - 100, starString, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '34px',
      color: '#fbbf24'
    }).setOrigin(0.5);

    // Performance Breakdown Table
    const tableY = height / 2 - 50;
    const stats = [
      { label: 'TACTICAL TAKEDOWNS', val: `${this.takedowns}` },
      { label: 'OPERATIONAL TIME', val: `${Math.round(this.elapsedSeconds)}s` },
      { label: 'STEALTH STATUS', val: isUndetected ? 'GHOST (+150 CR)' : 'DETECTED' },
      { label: 'CREDITS EXTRACTED', val: `+$${totalEarnedCredits}` }
    ];

    stats.forEach((st, idx) => {
      this.add.text(width / 2 - 190, tableY + idx * 28, st.label, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        color: '#94a3b8'
      });

      this.add.text(width / 2 + 190, tableY + idx * 28, st.val, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: idx === 3 ? '#ffb700' : '#e2e8f0'
      }).setOrigin(1, 0);
    });

    // Action Buttons
    const hasNextMission = MISSIONS.some(m => m.id === this.missionId + 1);

    if (hasNextMission) {
      this.createButton(width / 2, height / 2 + 90, 'NEXT MISSION', 0x00f0ff, () => {
        soundManager.playClick();
        this.scene.start('GameScene', { missionId: this.missionId + 1, operativeId: this.operativeId });
      });
    }

    this.createButton(width / 2 - (hasNextMission ? 110 : 0), height / 2 + (hasNextMission ? 140 : 90), 'ARMORY / UPGRADES', 0xf59e0b, () => {
      soundManager.playClick();
      soundManager.stopAmbientDrone();
      this.scene.start('UpgradesScene');
    });

    this.createButton(width / 2 + (hasNextMission ? 110 : 0), height / 2 + (hasNextMission ? 140 : 140), 'MISSION SELECT', 0x38bdf8, () => {
      soundManager.playClick();
      soundManager.stopAmbientDrone();
      this.scene.start('MissionSelectScene');
    });
  }

  createButton(x, y, text, accentColor, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x132236, 0.95);
    bg.fillRoundedRect(-95, -16, 190, 32, 4);
    bg.lineStyle(1.5, accentColor, 0.5);
    bg.strokeRoundedRect(-95, -16, 190, 32, 4);
    btn.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5);
    btn.add(label);

    btn.setSize(190, 32);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x1c3452, 1);
      bg.fillRoundedRect(-95, -16, 190, 32, 4);
      bg.lineStyle(2, accentColor, 1);
      bg.strokeRoundedRect(-95, -16, 190, 32, 4);
      label.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x132236, 0.95);
      bg.fillRoundedRect(-95, -16, 190, 32, 4);
      bg.lineStyle(1.5, accentColor, 0.5);
      bg.strokeRoundedRect(-95, -16, 190, 32, 4);
      label.setColor('#e2e8f0');
    });

    btn.on('pointerdown', callback);
    return btn;
  }
}
