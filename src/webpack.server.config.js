// webpack.server.config.js

const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    // This should point to your main server entry file (e.g., server.ts or main.server.ts)
    server: path.join(__dirname, 'server.ts'), 
  },
  resolve: { extensions: ['.ts', '.js'] },
  
  // Set the target environment to Node.js
  target: 'node',
  
  // Prevent Webpack from touching __dirname and __filename
  node: {
    __dirname: false,
    __filename: false,
  },
  
  // Crucial part: Exclude all Node modules except the ones you specifically need to bundle
  externals: [
    nodeExternals({
      allowlist: [
        /@angular\/platform-browser/,
        /@angular\/common/,
        /@angular\/core/,
        /@angular\/router/,
        // Add any other Angular modules your server needs to bundle
      ],
    }),
    // Explicitly exclude 'canvas'
    'canvas',
  ],

  // Module rules and output settings go here...
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ],
  },
  output: {
    path: path.join(__dirname, 'dist', 'server'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
};