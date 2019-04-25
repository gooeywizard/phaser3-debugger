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
		
		this.debugScene = {
			children: {
				list: []
			}
		};
		
		this.debug = [];
	}
	
	init(scene) {
		this.debugScene = scene;
		
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
			
			this.debug.push(obj);
		}
		
		this.isPaused = false;
		
		this.input.keyboard.on('keydown_' + this.pauseKey, (event) => {
			let key = this.debugScene.scene.key;
			
			if(!this.isPaused) {
				this.game.scene.pause(key);
				this.isPaused = true;
			} else {
				this.game.scene.resume(key);
				this.isPaused = false;
			}
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
}

export default DebugScene;