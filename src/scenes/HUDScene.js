import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  create(data) {
    this.gameScene = this.scene.get('GameScene');

    const width = this.scale.width;
    const height = this.scale.height;

    // Tactical top header bar
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0a101b, 0.85);
    topBar.fillRect(0, 0, width, 52);
    topBar.lineStyle(1.5, 0x00f0ff, 0.4);
    topBar.beginPath();
    topBar.moveTo(0, 52);
    topBar.lineTo(width, 52);
    topBar.strokePath();

    // 1. Mission Title & Objectives (Left)
    this.missionTitleText = this.add.text(24, 12, 'SHADOW//PROTOCOL', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#00f0ff'
    });

    this.objectiveText = this.add.text(24, 32, 'OBJECTIVE: ELIMINATE ALL TARGETS', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#8899aa'
    });

    // 2. Health Bar (Center Left)
    this.healthLabel = this.add.text(320, 12, 'OPERATIVE INTEGRITY', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#8899aa'
    });

    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x1a2638, 1);
    this.healthBarBg.fillRect(320, 28, 160, 12);

    this.healthBarFill = this.add.graphics();
    this.healthBarFill.fillStyle(0x00f0ff, 1);
    this.healthBarFill.fillRect(320, 28, 160, 12);

    // 3. Stealth Detection Indicator (Center)
    this.stealthStatusText = this.add.text(540, 18, 'STATUS: [UNDETECTED]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#10b981'
    });

    // 4. Targets Remaining (Center Right)
    this.targetsText = this.add.text(760, 18, 'TARGETS: 0/0', {
      fontFamily: 'Chakra Petch, Rajdhani, monospace',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24'
    });

    // 5. Credits Earned (Right)
    this.creditsText = this.add.text(940, 18, 'CREDITS: $0', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '15px',
      color: '#ffb700'
    });

    // 6. Pause Button (Far Right)
    this.pauseBtn = this.add.text(width - 90, 14, '[PAUSE]', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#00f0ff',
      backgroundColor: 'rgba(0, 240, 255, 0.1)',
      padding: { x: 8, y: 4 }
    }).setInteractive({ useHandCursor: true });

    this.pauseBtn.on('pointerdown', () => {
      this.gameScene.pauseGame();
    });

    // 7. Tactical Ability Button: SHADOW DECOY (Bottom Left)
    this.createDecoyButton(height);

    // 8. Takedown contextual helper (Bottom Center)
    this.helperText = this.add.text(width / 2, height - 36, 'MOVE: Left-Click / Tap | CANCEL: Right-Click | TAKEDOWN: Approach Behind Target', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#64748b'
    }).setOrigin(0.5);

    // Listen to GameScene events
    this.setupEventListeners();
  }

  createDecoyButton(height) {
    const btnContainer = this.add.container(90, height - 60);

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1b2d, 0.9);
    bg.fillRoundedRect(-70, -26, 140, 52, 6);
    bg.lineStyle(1.5, 0x00f0ff, 0.6);
    bg.strokeRoundedRect(-70, -26, 140, 52, 6);
    btnContainer.add(bg);

    const title = this.add.text(0, -12, 'SHADOW DECOY', {
      fontFamily: 'Chakra Petch, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00f0ff'
    }).setOrigin(0.5);
    btnContainer.add(title);

    this.decoyChargesText = this.add.text(0, 8, '[SPACE] CHARGES: 2/2', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#e2e8f0'
    }).setOrigin(0.5);
    btnContainer.add(this.decoyChargesText);

    btnContainer.setSize(140, 52);
    btnContainer.setInteractive({ useHandCursor: true });
    btnContainer.on('pointerdown', () => {
      this.gameScene.activateDecoyMode();
    });

    this.decoyBtn = btnContainer;
  }

  setupEventListeners() {
    this.gameScene.events.on('hud-update-health', ({ health, maxHealth }) => {
      const pct = Math.max(0, health / maxHealth);
      this.healthBarFill.clear();
      let color = 0x00f0ff;
      if (pct < 0.35) color = 0xef4444;
      else if (pct < 0.65) color = 0xf59e0b;

      this.healthBarFill.fillStyle(color, 1);
      this.healthBarFill.fillRect(320, 28, 160 * pct, 12);
    });

    this.gameScene.events.on('hud-update-targets', ({ remaining, total }) => {
      this.targetsText.setText(`TARGETS: ${total - remaining}/${total}`);
      if (remaining === 0) {
        this.objectiveText.setText('OBJECTIVE: EXTRACTION PAD UNLOCKED - EVACUATE');
        this.objectiveText.setColor('#10b981');
      }
    });

    this.gameScene.events.on('hud-update-credits', (credits) => {
      this.creditsText.setText(`CREDITS: $${credits}`);
    });

    this.gameScene.events.on('hud-update-decoy', ({ charges, maxCharges }) => {
      this.decoyChargesText.setText(`[SPACE] CHARGES: ${charges}/${maxCharges}`);
    });

    this.gameScene.events.on('hud-update-stealth', ({ state, maxDetection }) => {
      if (state === 'ALERT') {
        this.stealthStatusText.setText('STATUS: [ALARM ACTIVE]');
        this.stealthStatusText.setColor('#ef4444');
      } else if (maxDetection > 15) {
        this.stealthStatusText.setText(`STATUS: [DETECTING ${Math.round(maxDetection)}%]`);
        this.stealthStatusText.setColor('#f59e0b');
      } else {
        this.stealthStatusText.setText('STATUS: [UNDETECTED]');
        this.stealthStatusText.setColor('#10b981');
      }
    });
  }
}
