import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HUDScene } from './scenes/HUDScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { MissionSelectScene } from './scenes/MissionSelectScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { UpgradesScene } from './scenes/UpgradesScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

const config = {
  ...gameConfig,
  scene: [
    MainMenuScene,
    GameScene,
    HUDScene,
    PauseScene,
    GameOverScene,
    VictoryScene,
    MissionSelectScene,
    UpgradesScene,
    SettingsScene
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});
