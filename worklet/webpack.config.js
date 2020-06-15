const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
	mode: "production",
	devtool: "sourcemap",
	entry: {
		bitcrusher: "./bitcrusher.js"
	},
	output: {
		path: path.join(__dirname, "dist")
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				"README.md",
				"package.json",
				"package-lock.json",
				{
					from:
						"../target/wasm32-unknown-unknown/release/reactive_synth_bitcrusher_opt.wasm",
					to: "reactive_synth_bitcrusher.wasm"
				}
			]
		})
	]
};
