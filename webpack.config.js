const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

console.log("I was hit");

const webpack = require("webpack");
module.exports = {
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^(@injectivelabs|improbable-eng)$/u,
    }),
  ],
};
