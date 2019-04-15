class MainScene extends Phaser.Scene {
	
	constructor() {
		super({
			key: 'Main',
			active: true,
			fill: '#FFF'
		});
	}
	
	preload() {
		console.log('running init');
		this.load.image('logo', 'assets/gw_logo.png');
	}
	
	create() {
		this.cameras.main.setBackgroundColor('#ccc');

		const logo = this.add.image(150, 150, 'logo');
		// set debug = true for any entities you wish to debug
		logo.debug = true;

		this.tweens.add({
			targets: logo,
			x: 600,
			y: 400,
			angle: 360,
			duration: 2000,
			ease: 'Power2',
			yoyo: true,
			loop: -1
		});
		
		const logo2 = this.add.image(550, 150, 'logo');
		// set debug = true for any entities you wish to debug
		logo2.debug = true;

		this.tweens.add({
			targets: logo2,
			x: 200,
			y: 400,
			angle: 360,
			duration: 1500,
			ease: 'Power2',
			yoyo: true,
			loop: -1
		});
		
		this.game.scene.start('Debug', this);
		
		// this.isDebug = false;
		// this.input.keyboard.on('keydown_O', event => {
		// 	if(!this.isDebug) {
		// 		this.game.scene.start('Debug', this);
		// 		this.isDebug = true;
		// 	} else {
		// 		this.game.scene.stop('Debug');
		// 		this.isDebug = false;
		// 	}
		// });
	}
}

export default MainScene;