/**
 * Webpack Configuration for CandidAI Chrome Extension
 * Implements optimized build pipeline with code splitting
 * Handles multiple entry points for extension architecture
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: argv.mode || 'development',
    devtool: isProduction ? false : 'source-map',
    
    // Entry points for extension components
    entry: {
      'service-worker': './src/background/service-worker.ts',
      'content': './src/content/content.ts',
      'sidepanel': './src/sidepanel/sidepanel.ts',
      'options': './src/options/options.ts',
      'offscreen': './src/offscreen/offscreen.ts'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        // TypeScript files
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.json'
            }
          },
          exclude: /node_modules/
        },
        
        // JavaScript files
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-class-properties']
            }
          }
        },
        
        // CSS files
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        
        // Images
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        }
      ]
    },
    
    plugins: [
      // Extract CSS into separate files
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      
      // Copy static assets and manifest
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            to: 'manifest.json'
          },
          {
            from: 'src/assets/icons',
            to: 'assets/icons',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.gitkeep']
            }
          },
          // Copy icons to root for manifest.json references
          {
            from: 'src/assets/icons/*.png',
            to: '[name][ext]',
            noErrorOnMissing: true
          },
          {
            from: 'src/assets/images',
            to: 'assets/images',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.gitkeep']
            }
          },
          {
            from: 'src/assets/fonts',
            to: 'assets/fonts',
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.gitkeep']
            }
          },
          {
            from: 'src/css/*.css',
            to: 'css/[name][ext]',
            noErrorOnMissing: true
          },
          // Copy component-specific CSS files
          {
            from: 'src/sidepanel/sidepanel.css',
            to: 'sidepanel/sidepanel.css',
            noErrorOnMissing: true
          },
          {
            from: 'src/options/options.css',
            to: 'options/options.css',
            noErrorOnMissing: true
          },
          // Copy navigation fallback script
          {
            from: 'src/sidepanel/navigation-fallback.js',
            to: 'sidepanel/navigation-fallback.js',
            noErrorOnMissing: true
          }
        ]
      }),
      
      // Generate HTML files
      new HtmlWebpackPlugin({
        template: './src/sidepanel/sidepanel.html',
        filename: 'sidepanel/sidepanel.html',
        chunks: ['sidepanel'],
        inject: false
      }),
      
      new HtmlWebpackPlugin({
        template: './src/options/options.html',
        filename: 'options/options.html',
        chunks: ['options'],
        inject: false
      }),
      
      new HtmlWebpackPlugin({
        template: './src/offscreen/offscreen.html',
        filename: 'offscreen/offscreen.html',
        chunks: ['offscreen'],
        inject: false
      })
    ],
    
    optimization: {
      minimize: isProduction
    },
    
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@ts': path.resolve(__dirname, 'src/ts'),
        '@js': path.resolve(__dirname, 'src'),
        '@utils': path.resolve(__dirname, 'src/ts/utils'),
        '@services': path.resolve(__dirname, 'src/ts/services'),
        '@types': path.resolve(__dirname, 'src/ts/types')
      }
    },
    
    // Chrome extension specific settings
    target: 'web',
    
    performance: {
      hints: false
    }
  };
};