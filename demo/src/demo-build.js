import MainScene from './scenes/MainScene.js'

// default config values shown below
const debug = new DebugScene({
	props: ['x','y','angle'],
	color: '#da4d4d',
	pauseKey: 'P',
	pauseOnCollisions: false
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