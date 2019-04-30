# Phaser 3 Debugger
A debug scene that aids in debugging any other scene.

## Features
| Description | % Complete | Notes |
|-------------|------------|-------|
| Display user-configurable properties of any entities in the scene. | 90% | Doesn't handle nested properties (eg: 'prop.nested.inner') |
| Pause button. | 100% |  |
| Auto-pause when two physics bodies collide. | 33% | Only works for MatterJS |
| Show physics bodies. | 33% | Only works for MatterJS |

## Install
`npm install phaser3-debugger`

## Configure the Debug Scene
To enable debug for an entity, set `debug = true` on the entity.
Example: `sprite.debug = true;`

When creating the debug scene, you can pass in a config object. The table below shows the properties you can configure.

| Property | Description | Default |
|----------|-------------|---------|
| `props` | An array of the propertys to display. | `['x','y','angle']` |
| `color` | The color of the debug text. | `'#da4d4d'` |
| `pauseKey` | Hotkey to pause/unpause. | `'P'` |
| `pauseOnCollisions` | Enable to pause when bodies collide. | `false` |
| `pauseOnCollisionsKey` | Hotkey for toggling pause-on-collisions on/off. | `'C'` |
| `showBodies` | Enable debug mode for the physics engine. | `false` |
| `showBodiesKey` | Hotkey for toggling show-bodies on/off. | `'B'` |

## Run the Demo
1) Clone this repository.
2) `npm install`
3) `npm run demo-build`