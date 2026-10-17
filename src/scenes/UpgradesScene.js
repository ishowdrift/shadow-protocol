import Phaser from 'phaser';
import { OPERATIVE_TYPES } from '../utils/Constants.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/AudioSystem.js';

export class UpgradesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradesScene' });
  }

  create() {
    this.saveData = SaveSystem.load();

    const width = this.scale.width;
    const height = this.scale.height;

    // Dark grid background
    const bg = this.add.graphics();
    bg.fillStyle(0x060a12, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 45, 'OPERATIVE ARMORY // ENHANCEMENTS', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);

    this.creditsText = this.add.text(width / 2, 78, `AVAILABLE CREDITS: $${this.saveData.credits || 0}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffb700'
    }).setOrigin(0.5);

    // Left Column: Operative Class Selection
    this.renderOperativeCards(width, height);

    // Right Column: Cybernetic Upgrades
    this.renderUpgrades(width, height);

    // Back to Menu
    this.createBackButton(120, height - 40, () => {
      soundManager.playClick();
      this.scene.start('MainMenuScene');
    });
  }

  renderOperativeCards(width, height) {
    this.add.text(280, 125, '// SELECT ACTIVE OPERATIVE', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '15px',
      color: '#00f0ff'
    }).setOrigin(0.5);

    const ops = [OPERATIVE_TYPES.GHOST, OPERATIVE_TYPES.PHANTOM, OPERATIVE_TYPES.WRAITH];
    const cardW = 160;
    const cardH = 340;
    const startX = 120;
    const startY = 320;

    ops.forEach((op, idx) => {
      const cx = startX + idx * (cardW + 16);
      this.createOperativeCard(cx, startY, cardW, cardH, op);
    });
  }

  createOperativeCard(x, y, w, h, op) {
    const card = this.add.container(x, y);
    const isUnlocked = this.saveData.unlockedOperatives.includes(op.id);
    const isSelected = this.saveData.selectedOperative === op.id;

    const bg = this.add.graphics();
    bg.fillStyle(isSelected ? 0x0c2538 : (isUnlocked ? 0x0d1a29 : 0x070c14), 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, isSelected ? 0x00f0ff : (isUnlocked ? 0x224466 : 0x223344), isSelected ? 1 : 0.4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    card.add(bg);

    // Operative Name
    const name = this.add.text(0, -h / 2 + 20, op.name.split(' // ')[0], {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '16px',
      fontStyle: 'bold',
      color: isSelected ? '#00f0ff' : '#e2e8f0'
    }).setOrigin(0.5);
    card.add(name);

    // Subtitle
    const sub = this.add.text(0, -h / 2 + 38, op.name.split(' // ')[1], {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      color: '#64748b'
    }).setOrigin(0.5);
    card.add(sub);

    // Operative Avatar Sprite
    const sprite = this.add.sprite(0, -h / 2 + 85, 'player_sprite');
    if (op.tint && op.tint !== 0x00f0ff) sprite.setTint(op.tint);
    sprite.setScale(1.2);
    card.add(sprite);

    // Stats
    const statsText = this.add.text(0, -h / 2 + 160, `SPEED: ${op.speed}\nINTEGRITY: ${op.maxHealth} HP\nDECOY: ${op.decoyCharges} UNITS`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      color: '#94a3b8',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);
    card.add(statsText);

    // Description
    const desc = this.add.text(0, h / 2 - 80, op.description, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '11px',
      color: '#64748b',
      align: 'center',
      wordWrap: { width: w - 16 },
      lineSpacing: 2
    }).setOrigin(0.5);
    card.add(desc);

    // Button (Select, Unlock, or Active)
    const btnContainer = this.add.container(0, h / 2 - 30);
    const btnBg = this.add.graphics();
    const btnColor = isSelected ? 0x10b981 : (isUnlocked ? 0x00f0ff : 0xffb700);
    btnBg.fillStyle(btnColor, 0.15);
    btnBg.fillRoundedRect(-60, -14, 120, 28, 4);
    btnBg.lineStyle(1.5, btnColor, 0.7);
    btnBg.strokeRoundedRect(-60, -14, 120, 28, 4);
    btnContainer.add(btnBg);

    const btnText = isSelected ? 'ACTIVE' : (isUnlocked ? 'EQUIP' : `$${op.cost} UNLOCK`);
    const btnLabel = this.add.text(0, 0, btnText, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: isSelected ? '#10b981' : (isUnlocked ? '#00f0ff' : '#ffb700')
    }).setOrigin(0.5);
    btnContainer.add(btnLabel);

    if (!isSelected) {
      btnContainer.setSize(120, 28);
      btnContainer.setInteractive({ useHandCursor: true });
      btnContainer.on('pointerdown', () => {
        if (isUnlocked) {
          // Equip
          soundManager.playClick();
          this.saveData.selectedOperative = op.id;
          SaveSystem.save(this.saveData);
          this.scene.restart();
        } else {
          // Attempt Unlock
          if (this.saveData.credits >= op.cost) {
            soundManager.playCredit();
            this.saveData.credits -= op.cost;
            this.saveData.unlockedOperatives.push(op.id);
            this.saveData.selectedOperative = op.id;
            SaveSystem.save(this.saveData);
            this.scene.restart();
          } else {
            soundManager.playPlayerHit(); // Error buzz
          }
        }
      });
    }

    card.add(btnContainer);
  }

  renderUpgrades(width, height) {
    this.add.text(940, 125, '// FIELD ENHANCEMENTS', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '15px',
      color: '#00f0ff'
    }).setOrigin(0.5);

    const upgradesList = [
      {
        key: 'speedLevel',
        title: 'HYPER-SPRINT SERVOS',
        desc: '+10% Movement velocity per tier',
        max: 3,
        costs: [200, 400, 600]
      },
      {
        key: 'decoyCharges',
        title: 'TACTICAL DECOY CELLS',
        desc: '+1 Distraction beacon charge per tier',
        max: 2,
        costs: [300, 600]
      },
      {
        key: 'takedownRange',
        title: 'NEURAL DISRUPTOR RADIUS',
        desc: '+8px Silent execution reach per tier',
        max: 2,
        costs: [250, 500]
      }
    ];

    const startY = 175;
    const rowH = 100;

    upgradesList.forEach((up, idx) => {
      this.createUpgradeRow(940, startY + idx * rowH, 540, rowH - 12, up);
    });
  }

  createUpgradeRow(x, y, w, h, upgrade) {
    const row = this.add.container(x, y);
    const currentTier = this.saveData.upgrades[upgrade.key] || 0;
    const isMax = currentTier >= upgrade.max;
    const nextCost = isMax ? null : upgrade.costs[currentTier];

    const bg = this.add.graphics();
    bg.fillStyle(0x0d1a29, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, 0x1e3650, 0.5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    row.add(bg);

    // Title
    const title = this.add.text(-w / 2 + 20, -18, upgrade.title, {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    row.add(title);

    // Desc
    const desc = this.add.text(-w / 2 + 20, 6, `${upgrade.desc} (Tier ${currentTier}/${upgrade.max})`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#94a3b8'
    });
    row.add(desc);

    // Purchase Button
    const btnContainer = this.add.container(w / 2 - 80, 0);
    const btnBg = this.add.graphics();
    const btnColor = isMax ? 0x64748b : 0xffb700;
    btnBg.fillStyle(btnColor, 0.15);
    btnBg.fillRoundedRect(-60, -16, 120, 32, 4);
    btnBg.lineStyle(1.5, btnColor, 0.7);
    btnBg.strokeRoundedRect(-60, -16, 120, 32, 4);
    btnContainer.add(btnBg);

    const btnText = isMax ? 'MAX TIER' : `$${nextCost} UPGRADE`;
    const btnLabel = this.add.text(0, 0, btnText, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: btnColor
    }).setOrigin(0.5);
    btnContainer.add(btnLabel);

    if (!isMax) {
      btnContainer.setSize(120, 32);
      btnContainer.setInteractive({ useHandCursor: true });
      btnContainer.on('pointerdown', () => {
        if (this.saveData.credits >= nextCost) {
          soundManager.playCredit();
          this.saveData.credits -= nextCost;
          this.saveData.upgrades[upgrade.key] = currentTier + 1;
          SaveSystem.save(this.saveData);
          this.scene.restart();
        } else {
          soundManager.playPlayerHit(); // Buzz
        }
      });
    }

    row.add(btnContainer);
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
