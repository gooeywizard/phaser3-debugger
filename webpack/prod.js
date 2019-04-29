const merge = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const base = require("./base");

module.exports = merge(base, {
	mode: "production",
	entry: './src/DebugScene.js',
  output: {
		filename: "phaser3-debugger.min.js",
		library: 'phaser3Debugger',
		libraryTarget: 'umd'
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
	},
	plugins: [
		new CleanWebpackPlugin(["dist"], {
      root: path.resolve(__dirname, "../")
    })
	]
});
