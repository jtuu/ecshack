const path = require("path");

module.exports = {
  entry: {
    main: "./src/main.ts",
    EngineWorker: "./src/EngineWorker.ts"
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
    chunkFilename: '[chunkhash].js'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.des', '.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
  },
  module: {
    rules: [
      { test: /\.des$/, use: "raw-loader" },
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}
