const formatCoord = function(x, y) {
	return '(' + x + ',' + y + ')';
};

const formatAngle = function(angle) {
	let angleDeg = angle * 180 / Math.PI;
	return angleDeg + ' (' + angle.toFixed(2) + ')';
};

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
			pauseOnCollisions: false,
			pauseOnCollisionsKey: 'C',
			showBodies: false,
			showBodiesKey: 'B',
			slowDownGameKey: 'OPEN_BRACKET',
			speedUpGameKey: 'CLOSED_BRACKET',
			resetGameSpeedKey: 'BACK_SLASH',
			showCornerCoords: false,
			showDirectionAngles: false,
			helpMenuKey: 'ESC'
		}
		
		config = Object.assign(defaultConfig, config);
		
		this.globalProps = config.props;
		
		this.style = {
			font: '12px Arial',
			fill: config.color,
			stroke: config.color,
			strokeThickness: 1
		};
		
		this.hotkeys = {
			pause: config.pauseKey,
			pauseOnCollisions: config.pauseOnCollisionsKey,
			showBodies: config.showBodiesKey,
			slowDownGame: config.slowDownGameKey,
			speedUpGame: config.speedUpGameKey,
			resetGameSpeed: config.resetGameSpeedKey,
			helpMenu: config.helpMenuKey
		}
		
		this.pauseOnCollisions = config.pauseOnCollisions;
		
		this.showBodies = config.showBodies;

		this.showCornerCoords = config.showCornerCoords;
		this.showDirectionAngles = config.showDirectionAngles;
		
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
		
		this.events.on('prestep', (time, delta) => {
			let start = new Date().getTime();
			for(let i = 0; i < 1e7; i++) {
				if((new Date().getTime() - start) > this.gameDelay) {
					break;
				}
			}
		});
		
		this.initMenu();
		
		if(this.showCornerCoords) {
			this.initCornerCoords();
		}

		if(this.showDirectionAngles) {
			this.initDirectionAngles();
		}
		
		// enable physics debug mode if showBodies == true
		if(this.showBodies) {
			this.enablePhysicsDebugging();
		}
		
		// add collision listeners if pauseOnCollisions == true
		if(this.pauseOnCollisions) {
			this.enablePauseOnCollisions();
		}
		
		if(this.isDebuggable(this.debugScene)) {
			this.debug.push({
				entity: this.debugScene,
				hasPosition: false
			});
		}
		
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
		
		// create debug text for debugged entities
		let offset = 16;
		let globalX = 20;
		let globalY = 20;
		
		for(let i = 0; i < this.debug.length; i++) {
			let obj = this.debug[i];
			obj.props = this.getProps(obj.entity);
			obj.text = {};
			
			let x = this.getX(obj.entity);
			let y = this.getY(obj.entity);
			
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
			
			if(this.pauseOnCollisions && obj.entity.body) {
				this.addCollisionListener(obj.entity.body);
			}
		}
		
		this.gameDelayText = this.add.text(20, 20, 'Game Delay: ' + (this.gameDelay/1000) + 's', this.style);
		
		this.isPaused = false;
		
		// setup key event handlers
		
		this.input.keyboard.on('keydown_' + this.hotkeys.pause, event => {
			if(this.isPaused) {
				this.resumeScene();
			} else {
				this.pauseScene();
			}
		});
		
		this.input.keyboard.on('keydown_' + this.hotkeys.pauseOnCollisions, event => {
			if(this.pauseOnCollisions) {
				this.disablePauseOnCollisions();
			} else {
				this.enablePauseOnCollisions();
			}
		});
		
		this.input.keyboard.on('keydown_' + this.hotkeys.showBodies, event => {
			if(this.showBodies) {
				this.disableShowBodies();
			} else {
				this.enableShowBodies();
			}
		});
		
		this.input.keyboard.on('keydown_' + this.hotkeys.slowDownGame, event => {
			this.slowDownGame();
		});
		
		this.input.keyboard.on('keydown_' + this.hotkeys.speedUpGame, event => {
			this.speedUpGame();
		});
		
		this.input.keyboard.on('keydown_' + this.hotkeys.resetGameSpeed, event => {
			this.resetGameSpeed();
		});
		
		this.input.keyboard.on('keydown_' + this.hotkeys.helpMenu, event => {
			this.toggleHelpMenu();
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
	
	getValue(entity, prop) {
		let propParts = prop.split('.');
		
		let value = entity;
		for(let i = 0; i < propParts.length; i++) {
			value = value[propParts[i]];
		}
		
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
		this.scene.pause(this.debugScene.scene.key);
		this.isPaused = true;
	}
	
	resumeScene() {
		this.scene.resume(this.debugScene.scene.key);
		this.isPaused = false;
	}
	
	disablePauseOnCollisions() {
		this.pauseOnCollisions = false;
		
		if(this.debugScene.matter) {
			Phaser.Physics.Matter.Matter.Events.off(this.debugScene.matter.world.engine, 'collisionStart');
		}
		
		for(let i = 0; i < this.debug.length; i++) {
			let body = this.debug[i].entity.body;
			
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
			let body = this.debug[i].entity.body;
			
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
	
	initMenu() {
		this.helpDisplayed = true;
		this.helpText = [];
		
		let style = {
			font: '14px Arial',
			fill: '#FFF',
			stroke: '##FFF',
			backgroundColor: '#000',
			strokeThickness: 2
		};
		
		let offset = 24;
		let x = 300;
		let y = 200;
		
		this.helpText.push(this.add.text(x, y, 'Features', style));
		this.helpText.push(this.add.text(x, y + offset, 'Pause On Collisions: ' + (this.pauseOnCollisions ? 'Enabled' : 'Disabled'), style));
		this.helpText.push(this.add.text(x, y + offset * 2, 'Show Physics Bodies: ' + (this.showBodies ? 'Enabled' : 'Disabled'), style));
		this.helpText.push(this.add.text(x, y + offset * 3, 'Game Delay: ' + (this.gameDelay/1000) + 's', style));
		
		this.helpText.push(this.add.text(x, y + offset * 5, 'Hotkeys', style));
		let i = 6;
		for(let feature in this.hotkeys) {
			if(this.hotkeys.hasOwnProperty(feature)) {
				this.helpText.push(this.add.text(x, y + offset * i, this.prettify(feature) + ': ' + this.hotkeys[feature], style));
				i++;
			}
		}
		
		this.toggleHelpMenu();
	}
	
	toggleHelpMenu() {
		if(this.helpDisplayed) {
			// hide help
			this.helpDisplayed = false;
			this.resumeScene();
			for(let i = 0; i < this.helpText.length; i++) {
				this.helpText[i].visible = false;
			}
		} else {
			// show help
			this.helpDisplayed = true;
			this.pauseScene();
			
			this.helpText[1].setText('Pause On Collisions: ' + (this.pauseOnCollisions ? 'Enabled' : 'Disabled'));
			this.helpText[2].setText('Show Physics Bodies: ' + (this.showBodies ? 'Enabled' : 'Disabled'));
			this.helpText[3].setText('Game Delay: ' + (this.gameDelay/1000) + 's');
			
			for(let i = 0; i < this.helpText.length; i++) {
				this.helpText[i].visible = true;
			}
		}
	}
	
	initCornerCoords() {
		let camera = this.cameras.main;
		
		let inset = 5;
		
		this.cornerCoords = [];
		
		let x, y, text;
		
		x = camera.x;
		y = camera.y;
		text = this.add.text(x + inset, y + inset, formatCoord(x, y), this.style);
		this.cornerCoords.push(text);
		
		x = camera.x + camera.width;
		y = camera.y;
		text = this.add.text(x - inset, y + inset, formatCoord(x, y), this.style);
		text.setOrigin(1,0);
		this.cornerCoords.push(text);
		
		x = camera.x + camera.width;
		y = camera.y + camera.height;
		text = this.add.text(x - inset, y - inset, formatCoord(x, y), this.style);
		text.setOrigin(1,1);
		this.cornerCoords.push(text);
		
		x = camera.x;
		y = camera.y + camera.height;
		text = this.add.text(x + inset, y - inset, formatCoord(x, y), this.style);
		text.setOrigin(0,1);
		this.cornerCoords.push(text);
	}
	
	initDirectionAngles() {
		let camera = this.cameras.main;
		
		let inset = 5;
		
		this.directions = [];
		
		let x, y, angle, text;

		angle = 0 + camera.rotation;
		x = camera.x + camera.width - inset;
		y = camera.y + camera.height / 2;
		text = this.add.text(x, y, formatAngle(angle), this.style);
		text.setOrigin(1,0.5);
		this.directions.push(text);
		
		angle = Math.PI / 2 + camera.rotation;
		x = camera.x + camera.width / 2;
		y = camera.y + camera.height - inset;
		text = this.add.text(x, y, formatAngle(angle), this.style);
		text.setOrigin(0.5,1);
		this.directions.push(text);
		
		angle = Math.PI + camera.rotation;
		x = camera.x + inset;
		y = camera.y + camera.height / 2;
		text = this.add.text(x, y, formatAngle(angle), this.style);
		text.setOrigin(0,0.5);
		this.directions.push(text);
		
		angle = Math.PI * 3 / 2 + camera.rotation;
		x = camera.x + camera.width / 2;
		y = camera.y + inset;
		text = this.add.text(x, y, formatAngle(angle), this.style);
		text.setOrigin(0.5,0);
		this.directions.push(text);
	}
	
	prettify(str) {
		let resultStr = '';
		for(let i = 0; i < str.length; i++) {
			let char = str.charAt(i);
			if(char !== char.toLowerCase()) {
				resultStr += ' ';
			}
			
			if(i === 0) {
				resultStr += char.toUpperCase();
			} else {
				resultStr += char;
			}
		}
		
		return resultStr;
	}
}

export default DebugScene;