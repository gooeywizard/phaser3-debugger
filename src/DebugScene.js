class DebugScene extends Phaser.Scene {
	
	constructor(config={}) {
		super({
			key: 'Debug',
			active: false
		});
		
		let defaultConfig = {
			props: ['x','y','angle'],
			color: '#da4d4d',
			pauseKey: 'P',
			helpKey: 'ESC',
			pauseOnCollisions: false,
			pauseOnCollisionsKey: 'C',
			showBodies: false,
			showBodiesKey: 'B',
			// showFps: false,
			// showFpsKey: 'F',
			slowDownGameKey: 'OPEN_BRACKET',
			speedUpGameKey: 'CLOSED_BRACKET',
			resetGameSpeedKey: 'BACK_SLASH'
		}
		
		config = Object.assign(defaultConfig, config);
		
		this.globalProps = config.props;
		
		this.style = {
			font: '12px Arial',
			fill: config.color,
			stroke: config.color,
			strokeThickness: 1
		};
		
		this.pauseKey = config.pauseKey;
		
		this.pauseOnCollisions = config.pauseOnCollisions;
		this.pauseOnCollisionsKey = config.pauseOnCollisionsKey;
		
		this.showBodies = config.showBodies;
		this.showBodiesKey = config.showBodiesKey;
		
		// this.showFps = config.showFps;
		// this.showFpsKey = config.showFpsKey;
		
		this.slowDownGameKey = config.slowDownGameKey;
		this.speedUpGameKey = config.speedUpGameKey;
		this.resetGameSpeedKey = config.resetGameSpeedKey;
		this.gameDelay = 0;
		
		this.debugScene = {
			children: {
				list: []
			}
		};
		
		this.debug = [];
	}
	
	init(scene) {
		// the scene being debugged
		this.debugScene = scene;
		
		this.game.events.on('prestep', (time, delta) => {
			let start = new Date().getTime();
			for(let i = 0; i < 1e7; i++) {
				if((new Date().getTime() - start) > this.gameDelay) {
					break;
				}
			}
		});
		
		// enable physis debug mode if showBodies == true
		if(this.showBodies) {
			this.enablePhysicsDebugging();
		}
		
		// add collision listeners if pauseOnCollisions == true
		if(this.pauseOnCollisions) {
			this.enablePauseOnCollisions();
		}
		
		// if(this.showFps) {
		// 	this.enableShowFps();
		// }
		
		if(this.isDebuggable(this.debugScene)) {
			this.debug.push({
				entity: this.debugScene,
				hasPosition: false
			});
		}
		
		console.log('adding props from debug scene');
		
		for(let prop in this.debugScene) {
			if(this.debugScene.hasOwnProperty(prop)) {
				let entity = this.debugScene[prop];
				if(this.isDebuggable(entity)) {
					this.debug.push({
						entity: entity,
						hasPosition: this.getX(entity) !== null
					});
				}
			}
		}
		
		console.log('adding from children');
		
		let children = this.debugScene.children.list;
		for(let i = 0; i < children.length; i++) {
			let child = children[i];
			
			if(this.isDebuggable(child)) {
				this.debug.push({
					entity: child,
					hasPosition: this.getX(child) !== null
				});
			}
		}
		
		console.log('done adding ', this.debug[0]);
		
		// create debug text for debugged entities
		let offset = 16;
		let globalX = 20;
		let globalY = 20;
		
		for(let i = 0; i < this.debug.length; i++) {
			let obj = this.debug[i];
			console.log('getting props');
			obj.props = this.getProps(obj.entity);
			obj.text = {};
			
			let x = this.getX(obj.entity);
			let y = this.getY(obj.entity);
			console.log('x,y ', x, y);
			
			for(let j = 0; j < obj.props.length; j++) {
				let prop = obj.props[j];
				let value = this.getValue(obj.entity, prop);
				if(x === null) {
					x = globalX;
					globalY += offset;
					y = globalY;
				}
				obj.text[prop] = this.add.text(x, y + offset * j, prop + ': ' + value, this.style);
			}
			
			console.log('after loop');
			
			if(this.pauseOnCollisions && obj.entity.body) {
				this.addCollisionListener(obj.entity.body);
			}
		}
		
		console.log('finished making text');
		
		this.gameDelayText = this.add.text(20, 20, 'Game Delay: ' + (this.gameDelay/1000) + 's', this.style);
		
		this.isPaused = false;
		
		// setup key event handlers
		
		this.input.keyboard.on('keydown_' + this.pauseKey, event => {
			if(this.isPaused) {
				this.resumeScene();
			} else {
				this.pauseScene();
			}
		});
		
		this.input.keyboard.on('keydown_' + this.pauseOnCollisionsKey, event => {
			if(this.pauseOnCollisions) {
				this.disablePauseOnCollisions();
			} else {
				this.enablePauseOnCollisions();
			}
		});
		
		this.input.keyboard.on('keydown_' + this.showBodiesKey, event => {
			if(this.showBodies) {
				this.disableShowBodies();
			} else {
				this.enableShowBodies();
			}
		});
		
		// this.input.keyboard.on('keydown_' + this.showFpsKey, event => {
		// 	if(this.showFps) {
		// 		this.disableShowFps();
		// 	} else {
		// 		this.enableShowFps();
		// 	}
		// });
		
		this.input.keyboard.on('keydown_' + this.slowDownGameKey, event => {
			this.slowDownGame();
		});
		
		this.input.keyboard.on('keydown_' + this.speedUpGameKey, event => {
			this.speedUpGame();
		});
		
		this.input.keyboard.on('keydown_' + this.resetGameSpeedKey, event => {
			this.resetGameSpeed();
		});
	}
	
	update() {
		// if(this.fpsText) {
		// 	this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2));
		// }
		
		if(this.gameDelay > 0) {
			this.gameDelayText.setText('Game Delay: ' + (this.gameDelay/1000) + 's');
		} else {
			this.gameDelayText.setText('');
		}
		
		let offset = 16;
		let globalX = 20;
		let globalY = 20 + offset;
		let globalJ = 0;
		
		for(let i = 0; i < this.debug.length; i++) {
			let obj = this.debug[i];
			
			let x = this.getX(obj.entity);
			let y = this.getY(obj.entity);
			
			for(let j = 0; j < obj.props.length; j++) {
				let prop = obj.props[j];
				let value = this.getValue(obj.entity, prop);
				let localJ = j;
				if(!obj.hasPosition) {
					x = globalX;
					y = globalY;
					localJ = globalJ;
					globalJ++;
				}
				
				let text = obj.text[prop];
				
				console.log(obj.entity + '');
				text.setText(prop + ': ' + value);
				text.x = x;
				text.y = y + offset * localJ;
			}
		}
	}
	
	isDebuggable(child) {
		return child.debug === true || child.debug instanceof Array;
	}
	
	getProps(child) {
		if(child.debug instanceof Array) {
			return child.debug;
		}
		
		return this.globalProps;
	}
	
	getValue(child, prop) {
		let value = child[prop];
		
		if(Number.isFinite(value)) {
			// TODO: make this configurable
			value = value.toFixed(2);
		}
		
		return value;
	}
	
	getX(entity) {
		
		if(Number.isFinite(entity.x)) {
			return entity.x - entity.width / 2;
			
		} else if(entity.sprite && Number.isFinite(entity.sprite.x)) {
			return entity.sprite.x - entity.sprite.width / 2;
			
		} else if(entity.body && Number.isFinite(entity.body.position.x)) {
			// is this only true in MatterJS?
			return entity.body.position.x - entity.body.width / 2;
		}
		
		return null;
	}
	
	getY(entity) {
		
		if(Number.isFinite(entity.y)) {
			return entity.y + entity.height / 2;
			
		} else if(entity.sprite && Number.isFinite(entity.sprite.y)) {
			return entity.sprite.y + entity.sprite.height / 2;
			
		} else if(entity.body && Number.isFinite(entity.body.position.y)) {
			// is this only true in MatterJS?
			return entity.body.position.y + entity.body.height / 2;
		}
		
		return null;
	}
	
	enablePhysicsDebugging() {
		if(this.debugScene.matter) {
			this.debugScene.matter.world.createDebugGraphic();
			
			this.debugScene.events.once('shutdown', this.disablePhysicsDebugging, this);
		}
	}
	
	disablePhysicsDebugging() {
		if(this.debugScene.matter) {
			this.debugScene.matter.world.drawDebug = false;
			
			this.debugScene.matter.world.debugGraphic.destroy();
			this.debugScene.matter.world.debugGraphic = undefined;
		}
	}
	
	pauseScene() {
		this.game.scene.pause(this.debugScene.scene.key);
		this.isPaused = true;
	}
	
	resumeScene() {
		this.game.scene.resume(this.debugScene.scene.key);
		this.isPaused = false;
	}
	
	disablePauseOnCollisions() {
		this.pauseOnCollisions = false;
		
		if(this.debugScene.matter) {
			Phaser.Physics.Matter.Matter.Events.off(this.debugScene.matter.world.engine, 'collisionStart');
		}
		
		for(let i = 0; i < this.debug.length; i++) {
			let body = this.debug[i].child.body;
			
			if(body) {
				this.removeCollisionListener(body);
			}
		}
	}
	
	enablePauseOnCollisions() {
		this.pauseOnCollisions = true;
		
		if(this.debugScene.matter) {
			Phaser.Physics.Matter.Matter.Events.on(this.debugScene.matter.world.engine, 'collisionStart', function(event) {
				for(let i = 0; i < event.pairs.length; i++) {
					let pair = event.pairs[i];
					Phaser.Physics.Matter.Matter.Events.trigger(pair.bodyA, 'collision', { pair: pair });
					Phaser.Physics.Matter.Matter.Events.trigger(pair.bodyB, 'collision', { pair: pair });
				}
			});
		}
		
		for(let i = 0; i < this.debug.length; i++) {
			let body = this.debug[i].child.body;
			
			if(body) {
				this.addCollisionListener(body);
			}
		}
	}
	
	addCollisionListener(body) {
		if(this.debugScene.matter) {
			Phaser.Physics.Matter.Matter.Events.on(body, 'collision', event => {
				this.pauseScene();
			});
		}
	}
	
	removeCollisionListener(body) {
		if(this.debugScene.matter) {
			Phaser.Physics.Matter.Matter.Events.off(body, 'collision');
		}
	}
	
	disableShowBodies() {
		this.showBodies = false;
		
		this.disablePhysicsDebugging();
	}
	
	enableShowBodies() {
		this.showBodies = true;
		
		this.enablePhysicsDebugging();
	}
	
	// disableShowFps() {
	// 	this.showFps = false;
	// 	this.fpsText.destroy();
	// 	this.fpsText = null;
	// }
	
	// enableShowFps() {
	// 	this.showFps = true;
	// 	this.fpsText = this.add.text(20, 20, 'FPS: ' + this.game.loop.actualFps.toFixed(2), this.style);
	// }
	
	slowDownGame() {
		this.gameDelay += 10;
	}
	
	speedUpGame() {
		this.gameDelay -= 10;
		
		if(this.gameDelay < 0) {
			this.gameDelay = 0;
		}
	}
	
	resetGameSpeed() {
		this.gameDelay = 0;
	}
}

export default DebugScene;