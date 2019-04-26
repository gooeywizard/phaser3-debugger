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

		const logo = this.add.image(150, 600, 'logo');
		// set debug = true for any entities you wish to debug
		logo.debug = true;

		this.tweens.add({
			targets: logo,
			x: 600,
			y: 150,
			angle: 360,
			duration: 4000,
			ease: 'Sine.easeInOut',
			yoyo: true,
			loop: -1,
			loopDelay: 500
		});
		
		const logo2 = this.add.image(150, 600, 'logo');
		// add a custom string prop to show debugging a string
		logo2.name = 'Logo 2';
		// set debug = object w/ properties you want to debug on that entity only
		logo2.debug = ['x', 'rotation', 'name'];

		this.tweens.add({
			targets: logo2,
			x: 600,
			angle: 180,
			duration: 4000,
			ease: 'Sine.easeInOut',
			yoyo: true,
			loop: -1,
			loopDelay: 500
		});
		
		this.matter.world.setBounds(0,0, this.game.config.width, this.game.config.height);
		
		let logo3 = this.matter.add.image(600, 150, 'logo');
		logo3.setCircle();
		logo3.setFriction(0.005);
		logo3.setBounce(1.25);
		logo3.debug = true;
		
		this.debugMsg = [{
			
		}];
		
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