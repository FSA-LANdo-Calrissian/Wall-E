import Phaser from 'phaser';
import config from './config/config';
import FgScene from './scenes/FgScene';
import MainScene from './scenes/MainScene';
import HUDScene from './scenes/HUDScene';

export default class Game extends Phaser.Game {
  constructor() {
    super(config);

    // Import all the scenes and call it here
    this.scene.add('FgScene', FgScene);
    this.scene.add('MainScene', MainScene);
    this.scene.add('HUDScene', HUDScene);
    this.scene.bringToTop('HUDScene');

    // Then start the game by calling the main scene - or the very first one
    this.scene.start('MainScene');
  }
}

// This loads up our game when the browser window loads.
window.onload = function () {
  window.game = new Game();
};
