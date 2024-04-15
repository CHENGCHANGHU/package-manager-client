import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { VueLoaderPlugin } from 'vue-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDevelopment = process.env.NODE_ENV !== 'production';

export const BaseConfig = {
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    modules: [resolve(__dirname, 'packages'), 'node_modules'],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx', '.scss', '.css'],
    alias: {
      'root': join(__dirname, '..'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          }
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  { modules: false }
                ],
                // '@babel/preset-typescript',
              ]
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  { modules: false }
                ],
                // '@babel/preset-typescript',
              ]
            },
          },
          {
            loader: 'ts-loader',
            options: {
              context: join(__dirname, '..'),
              configFile: join(__dirname, '..', 'tsconfig.json'),
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          // isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.svg/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
};

export function getMergedConfig(config = {}) {
  return merge(BaseConfig, config);
}
