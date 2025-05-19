const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'background/service-worker': './src/background/service-worker.js',
    'content/content': './src/content/content.js',
    'content/platform-integration': './src/content/platform-integration.js',
    'offscreen/offscreen': './src/offscreen/offscreen.js',
    'options/options': './src/options/options.js',
    'sidepanel/sidepanel': './src/sidepanel/sidepanel.js'
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'icons/logos', to: 'icons' },
        { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
        { from: 'src/_locales', to: '_locales' },
        { from: 'src/css', to: 'css' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/sidepanel/sidepanel.html',
      filename: 'sidepanel/sidepanel.html',
      chunks: ['sidepanel/sidepanel'],
      inject: true,
      publicPath: '../'
    }),
    new HtmlWebpackPlugin({
      template: './src/options/options.html',
      filename: 'options/options.html',
      chunks: ['options/options'],
      inject: 'head',
      publicPath: './',
      scriptLoading: 'defer'
    }),
    new HtmlWebpackPlugin({
      template: './src/offscreen/offscreen.html',
      filename: 'offscreen/offscreen.html',
      chunks: ['offscreen/offscreen'],
      inject: true,
      publicPath: '../'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'dist/options/options.html',
          to: 'options/options.html',
          transform(content) {
            return content.toString().replace(/src="\.\/options\/options\.js"/g, 'src="options.js"');
          },
          noErrorOnMissing: true,
          force: true
        },
        {
          from: 'dist/sidepanel/sidepanel.html',
          to: 'sidepanel/sidepanel.html',
          transform(content) {
            return content.toString().replace(/src="\.\/sidepanel\/sidepanel\.js"/g, 'src="sidepanel.js"');
          },
          noErrorOnMissing: true,
          force: true
        },
        {
          from: 'dist/offscreen/offscreen.html',
          to: 'offscreen/offscreen.html',
          transform(content) {
            return content.toString().replace(/src="\.\/offscreen\/offscreen\.js"/g, 'src="offscreen.js"');
          },
          noErrorOnMissing: true,
          force: true
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
