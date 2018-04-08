
var webpack = require('webpack');


module.exports = {
	entry:'./src/test.js',
	module:{
		rules:[
			{test:/\.js$/,exclude:/node_modules/,loader:'babel-loader',query:{presets:['es2015']}}
		]
	},
	output:{
		filename:'./dist/bundle.js'
	}

}
