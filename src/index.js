import Phaser from 'phaser'

import MainScene from './scenes/MainScene'
import DebugScene from './scenes/DebugScene'

// default config values shown below
const debug = new DebugScene({
	props: ['x','y','angle'],
	color: '#da4d4d',
	pauseKey: 'P'
});

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 800,
  scene: [
		MainScene,
		debug
	]
});