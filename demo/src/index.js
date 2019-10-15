import Phaser from 'phaser'

import MainScene from './scenes/MainScene'
import DebugScene from '../../src/DebugScene'

const debug = new DebugScene({
	props: ['x','y','angle'],
	color: '#da4d4d',
	pauseKey: 'P',
	pauseOnCollisions: false,
	showCornerCoords: true,
	showDirectionAngles: true
});

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: 800,
  height: 800,
  scene: [
		MainScene,
		debug
	],
	physics: {
		default: 'matter',
		matter: {
			debug: false
		}
	}
});