const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require("./base");

module.exports = merge(base, {
	mode: "development",
	
	entry: './demo/src/index.js',
	
	devtool: "eval-source-map",
	plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
		})
	]
});