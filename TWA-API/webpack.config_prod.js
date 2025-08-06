const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./bin/config",
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json"],
  },
  mode: "production",
  target: "node",
  externals: {
    pg: "commonjs pg",
    sequelize: "commonjs sequelize",
  },
};
