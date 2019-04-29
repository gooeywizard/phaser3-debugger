# Phaser 3 Debugger
A simple debug scene that makes it easy to 1) pause at any time and 2) see current stats on any or all sprites and bodies.

NOTE: There is currently no build version. If you want to use this in your own project, either copy the DebugScene.js file, or wait until I create a nice build you can import.

## Run the Demo
1) Clone this repository.
2) `npm install`
3) `npm start`

While it is running, press 'P' to pause/unpause.

## Configure the Debug Scene
To enable debug for an entity, set `debug = true` on the entity.
Example: `sprite.debug = true;`

When creating the debug scene, you can pass in a config object. The table below shows the properties you can configure.

| Property | Description | Default |
|----------|-------------|---------|
| `props` | An array of the propertys to display. | `['x','y','angle']` |
| `color` | The color of the debug text. | `'#da4d4d'` |
| `pauseKey` | The key to map to pause/unpause. | `'P'` |
