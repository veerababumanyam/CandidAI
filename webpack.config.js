const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'background/service-worker': './src/background/service-worker.js',
    'sidepanel/sidepanel': './src/sidepanel/sidepanel.js',
    'options/options': './src/options/options.js',
    'content/content': './src/content/content.js',
    'offscreen/offscreen': './src/offscreen/offscreen.js',
    'visual-analysis': './src/visual-analysis.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/css', to: 'css' },
        { from: 'icons/logos', to: 'icons' },
        { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
        { from: 'src/_locales', to: '_locales' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/sidepanel/sidepanel.html',
      filename: 'sidepanel/sidepanel.html',
      chunks: ['sidepanel/sidepanel']
    }),
    new HtmlWebpackPlugin({
      template: './src/options/options.html',
      filename: 'options/options.html',
      chunks: ['options/options']
    }),
    new HtmlWebpackPlugin({
      template: './src/offscreen/offscreen.html',
      filename: 'offscreen/offscreen.html',
      chunks: ['offscreen/offscreen']
    }),
    new HtmlWebpackPlugin({
      template: './src/visual-analysis.html',
      filename: 'visual-analysis.html',
      chunks: ['visual-analysis']
    })
  ],
  resolve: {
    extensions: ['.js']
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
