const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "production",
	// mode: "development",
	// devtool: "inline-source-map",
	entry: "./frontend/script.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
		clean: false,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./frontend/index.html",
			title: "usl signify",
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.js$/i,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
		],
	},
};
