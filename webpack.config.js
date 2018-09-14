module.exports = {
    "mode": "production",
    "entry": "./src/brand-site.js",
    "output": {
        "path": __dirname+'/dist',
        "filename": "brand-site.js"
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
			}
        ]
    }
}