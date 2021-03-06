import { resolve } from "path";
import webpack from "webpack";
// import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import merge from "webpack-merge"

const ROOT = __dirname

const BASE_CONFIG = {
	mode: "production",
	entry: {
		// jsonx: resolve(ROOT, "src/index.ts"),
		jsonx: resolve(ROOT, "lib/esm/index.js")
	},
	output:{
		path: resolve(ROOT, "lib/browser"),
		library: 'JSONX_LIB',
	},
	resolve: {
		extensions: [".js", ".ts"]
	},
	module: {
		rules: [
			{
				test: /\.(ts)$/,
				loader: "ts-loader",
				options: {
					configFile: resolve(ROOT, "./src/tsconfig.esm.json")
				}
			},
		]
	},
	plugins: [
		new webpack.BannerPlugin(
			`Copyright (c) 2019 light0x00
		Licensed under the MIT License (MIT), see
		https://github.com/light0x00/jsonx`),
		// new BundleAnalyzerPlugin({
		// 	analyzerMode: "static",
		// 	reportFilename: "analyzer-report.html",
		// 	openAnalyzer: false,
		// }),
	]
}

const FAT_PROFILE = merge(BASE_CONFIG, {
	output: {
		filename: "[name].js",
	},
	optimization:{
        minimize: false, 
    }
})

const MINIFY_PROFILE = merge(BASE_CONFIG, {
	output: {
		filename: "[name].min.js",
	},
})

export default [
	FAT_PROFILE, MINIFY_PROFILE
]