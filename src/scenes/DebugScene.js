class DebugScene extends Phaser.Scene {
	
	constructor(config={}) {
		super({
			key: 'Debug',
			active: false
		});
		
		this.props = config.props || ['x','y','angle'];
		this.style = {
			font: '12px Arial',
			fill: config.color || '#da4d4d'
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
			
			if(!child.debug) {
				continue;
			}
			
			let x = child.x - child.width;
			let y = child.y + child.height * 2;
			let offset = 16;
			
			let obj = {
				child: child
			};
			
			for(let j = 0; j < this.props.length; j++) {
				let prop = this.props[j];
				obj[prop] = this.add.text(x, y + offset * j, prop + ': ' + child[prop].toFixed(2), this.style);
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
			
			for(let j = 0; j < this.props.length; j++) {
				let prop = this.props[j];
				obj[prop].setText(prop + ': ' + child[prop].toFixed(2));
				obj[prop].x = x;
				obj[prop].y = y + offset * j;
			}
		}
	}
}

export default DebugScene;