class DebugScene extends Phaser.Scene {
	
	constructor(config={}) {
		super({
			key: 'Debug',
			active: false
		});
		
		this.globalProps = config.props || ['x','y','angle'];
		
		let color = config.color || '#da4d4d';
		this.style = {
			font: '12px Arial',
			fill: color,
			stroke: color,
			strokeThickness: 1
		};
		
		this.pauseKey = config.pauseKey || 'P';
		
		this.pauseOnCollisions = config.pauseOnCollisions || false;
		
		this.showBodies = config.showBodies || true;
		
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
		
		// enable physis debug mode if showBodies == true
		if(this.showBodies) {
			this.enablePhysicsDebugging();
			this.debugScene.events.on('shutdown', this.disablePhysicsDebugging, this);
		}
		
		// add collision listeners if pauseOnCollisions == true
		if(this.pauseOnCollisions) {
			if(this.debugScene.matter) {
				Phaser.Physics.Matter.Matter.Events.on(this.debugScene.matter.world.engine, 'collisionStart', function(event) {
					for(let i = 0; i < event.pairs.length; i++) {
						let pair = event.pairs[i];
						Phaser.Physics.Matter.Matter.Events.trigger(pair.bodyA, 'collision', { pair: pair });
						Phaser.Physics.Matter.Matter.Events.trigger(pair.bodyB, 'collision', { pair: pair });
					}
				});
			}
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
		
		this.input.keyboard.on('keydown_' + this.pauseKey, (event) => {
			this.pauseScene();
		});
	}
	
	update() {
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
			// this.debugScene.matter.config.debug = true;
			this.debugScene.matter.world.drawDebug = true;
			// this.debugScene.matter.world.engine.debug = true;
			
			this.debugScene.matter.world.createDebugGraphic();
		}
	}
	
	disablePhysicsDebugging() {
		if(this.debugScene.matter) {
			// this.debugScene.matter.config.debug = false;
			this.debugScene.matter.world.drawDebug = false;
			// this.debugScene.matter.world.engine.debug = false;
			
			// this.debugScene.matter.world.debugGraphic
		}
	}
	
	pauseScene() {
		let key = this.debugScene.scene.key;
			
		if(!this.isPaused) {
			this.game.scene.pause(key);
			this.isPaused = true;
		} else {
			this.game.scene.resume(key);
			this.isPaused = false;
		}
	}
	
	addCollisionListener(body) {
		if(this.debugScene.matter) {
			Phaser.Physics.Matter.Matter.Events.on(body, 'collision', event => {
				console.log('colliding!');
				this.pauseScene();
			});
		}
	}
}

export default DebugScene;