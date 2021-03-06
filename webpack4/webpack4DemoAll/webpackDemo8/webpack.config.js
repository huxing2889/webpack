const resolve = require('./config/resolve.js')
const baseConfig = require('./build/webpack.base.config.js')
const config = require('./config/index.js')
const merge = require('webpack-merge')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin") //压缩css
const UglifyJsPlugin = require("uglifyjs-webpack-plugin") //压缩js
const manifest = require('./vendor/vendor-manifest.json')
const webpack = require('webpack')
module.exports = merge({}, baseConfig, config.production.isSourceMap ? {
	devtool: '#source-map'
} : {}, {
	mode: 'production',
	entry: {
		app: resolve('./src/main.js')
	},
	output: {
		path: resolve('dist'),
		filename: './js/[name].[chunkHash:5].js',
		chunkFilename:'./js/[name].[chunkHash:5].js'
	},
	optimization: {
		minimizer: [
			new UglifyJsPlugin({ //压缩js
				cache: false,
				parallel: true,
				sourceMap: config.production.isSourceMap, // set to true if you want JS source maps
				uglifyOptions: {
					compress: {
						warnings: false,
						drop_console: true //剔除压缩代码中的console所有
					},
					output: {
						comments: false, //去除注释
						beautify: false //代码一行
					}
				}
			}),
			new OptimizeCSSAssetsPlugin()
		]/*,
		splitChunks:{
			cacheGroups:{
				commons:{
					name:'vendor',
					chunks:'all'
				}
			}
		}*/
	},
	module: {},
	plugins: [
		new CleanWebpackPlugin('dist/**/*'),
		new webpack.DllReferencePlugin({
			context: resolve('./'),
			manifest: manifest,
			name: manifest.name
		}),
		new HtmlWebpackPlugin({
			minify: {
				removeComments: true, //去除注释 // https://github.com/kangax/html-minifier#options-quick-reference
				collapseWhitespace: true, //去除html标签的空格
				removeAttributeQuotes: true //删除删除双引号
			},
			template: config.common.template,
			inject: true
		}),
		new HtmlWebpackIncludeAssetsPlugin({
			assets: ['./vendor/' + manifest.name + '.js'],
			append: false //注入到js的前面
		}),
		new HtmlWebpackIncludeAssetsPlugin({
			assets: config.common.includeAssets,
			append: false //是否注入到最后，可多写几个
		}),
		new CopyWebpackPlugin([{
			from: resolve('vendor'),
			to: 'vendor',
			ignore: ['*.json']
		}]),
		new CopyWebpackPlugin(config.common.copy)
	]
})