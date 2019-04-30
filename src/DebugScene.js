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
			showFps: false,
			showFpsKey: 'F'
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
		
		this.showFps = config.showFps;
		this.showFpsKey = config.showFpsKey;
		
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
		
		// this.stepDelay = 100;
		this.stepDelay = null;
		if(this.stepDelay) {
			this.game.events.on('prestep', (time, delta) => {
				let start = new Date().getTime();
				for(let i = 0; i < 1e7; i++) {
					if((new Date().getTime() - start) > this.stepDelay) {
						break;
					}
				}
			});
		}
		
		// enable physis debug mode if showBodies == true
		if(this.showBodies) {
			this.enablePhysicsDebugging();
		}
		
		// add collision listeners if pauseOnCollisions == true
		if(this.pauseOnCollisions) {
			this.enablePauseOnCollisions();
		}
		
		if(this.showFps) {
			this.enableShowFps();
		}
		
		let children = this.debugScene.children.list;
		for(let i = 0; i < children.length; i++) {
			let child = children[i];
			
			if(!this.isDebuggable(child)) {
				continue;
			}
			
			let x = child.x - child.width;
			let y = child.y + child.height * 2;
			let offset = 16;
			
			let obj = {
				child: child
			};
			
			let props = this.getProps(child);
			
			for(let j = 0; j < props.length; j++) {
				let prop = props[j];
				let value = this.getValue(child, prop);
				obj[prop] = this.add.text(x, y + offset * j, prop + ': ' + value, this.style);
			}
			
			if(this.pauseOnCollisions && child.body) {
				this.addCollisionListener(child.body);
			}
			
			this.debug.push(obj);
		}
		
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
			console.log('pause on collide');
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
		
		this.input.keyboard.on('keydown_' + this.showFpsKey, event => {
			if(this.showFps) {
				this.disableShowFps();
			} else {
				this.enableShowFps();
			}
		});
	}
	
	update() {
		if(this.fpsText) {
			this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2));
		}
		
		for(let i = 0; i < this.debug.length; i++) {
			let obj = this.debug[i];
			let child = obj.child;
			let x = child.x - child.width / 2;
			let y = child.y + child.height / 2;
			let offset = 16;
			
			let props = this.getProps(child);
			
			for(let j = 0; j < props.length; j++) {
				let prop = props[j];
				let value = this.getValue(child, prop);
				obj[prop].setText(prop + ': ' + value);
				obj[prop].x = x;
				obj[prop].y = y + offset * j;
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
	
	disableShowFps() {
		this.showFps = false;
		this.fpsText.destroy();
		this.fpsText = null;
	}
	
	enableShowFps() {
		this.showFps = true;
		this.fpsText = this.add.text(20, 20, 'FPS: ' + this.game.loop.actualFps.toFixed(2), this.style);
	}
}

export default DebugScene;