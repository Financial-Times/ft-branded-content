const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    "mode": "production",
    "entry": { "brand-content": "./src/brand-content.js" },
    "output": {
        path: __dirname+'/dist',
		filename: "[name].js",
		library: "ft",
		libraryTarget: "window"
    },
    "devtool": "source-map",
    "module": {
        "rules": [
            {
                "test": /\.js$/,
                "exclude": /node_modules/,
                "use": {
                    "loader": "babel-loader",
                    "options": {
                        "presets": [
                            "env"
                        ]
                    }
                }
			},
			{
				test: /\.css$/,
				use: [
				  {
					loader: MiniCssExtractPlugin.loader
				  },
				  "css-loader"
				]
			  }
        ]
	},
	plugins: [
		new MiniCssExtractPlugin({
		  // Options similar to the same options in webpackOptions.output
		  // both options are optional
		  filename: "[name].css",
		  chunkFilename: "[id].css"
		})
	  ],
	  optimization: {
		minimizer: [
		  new OptimizeCSSAssetsPlugin({})
		]
	  }
}