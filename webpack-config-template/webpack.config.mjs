import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeWithRules } from 'webpack-merge';
import { BaseConfig } from "./webpack.base.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default mergeWithRules({
  module: {
    rules: {
      test: "match",
      use: {
        loader: "match",
        options: "replace",
      },
    },
  },
})(BaseConfig, {
  entry: {
    index: join(__dirname, '..', 'src', 'index.ts'),
  },
  output: {
    clean: true,
    path: join(__dirname, '..', 'dist'),
    filename: 'js/[name].js',
    library: {
      type: 'umd',
      name: 'mh5-ui',
    },
  },
  resolve: {
    alias: {
      '@': join(__dirname, '..', 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              context: join(__dirname, '..'),
              configFile: join(__dirname, '..', 'tsconfig.json'),
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      }
    ],
  },
  externals: [
    {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue',
      },
    }
  ],
});
