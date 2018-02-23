var path = require('path');
var webpack = require('webpack');

module.exports = {
	devtool: 'source-map',
	entry: ["babel-polyfill","./src/index.js"],
	output: {
		publicPath:'/dist/',
		path: path.resolve(__dirname, './dist'),
		filename: "main.js"
	},
	module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/,/ChartIQ/],
        use: [
          'babel-loader',
        ],
      },
    ],
  },
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
			}
		})
	],
	devServer: {
		port: 3000,
		compress: true,
		inline: true,
		stats: 'minimal'
	},
	resolve: {
		extensions: ['.js', '.jsx']
	}
};
