const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
	entry: './source/index.tsx',
	devtool: 'eval-source-map',
	devServer: {
		static: path.join(__dirname, 'dist'),
		host: '0.0.0.0',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpe?g|gif|svg|pdf)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]',
						esModule: false,
					}
				}]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource'
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		fallback: { "buffer": false }
	},
	performance: {
		hints: false
	},
	output: {
		filename: 'js/main.[fullhash:8].js',
		chunkFilename: 'js/[name].[fullhash:8].chunk.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		clean: true
	},
	devServer: {
		historyApiFallback: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'flowR Dataflow Visualizer',
			favicon: 'images/icons/favicon.png'
		}),
		new WebpackManifestPlugin({
			fileName: 'asset-manifest.json',
			generate: (seed, files, entries) => {
				const manifestFiles = files.reduce((manifest, file) => {
					manifest[file.name] = file.path;
					return manifest;
				}, {});
				const entrypoints = Object.keys(entries).reduce((manifest, entry) => {
					manifest[entry] = entries[entry].filter(fileName => !fileName.endsWith('.map'));
					return manifest;
				}, {});

				return {
					files: manifestFiles,
					entrypoints: entrypoints
				};
			}
		}),
		new CopyPlugin({
			patterns: [
				{
					from: "config.json",
					context: path.resolve(__dirname, "source", "config"),
				},
			],
			options: {
				concurrency: 100,
			},
		})
	]
};