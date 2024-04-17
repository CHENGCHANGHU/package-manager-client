import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { cp, opendir, readFile, rename, writeFile } from 'node:fs/promises';
import readline from 'node:readline';
import { camelString, gracefullyExit, rewriteFile } from './utils.mjs';
import { createLog } from './print.mjs';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { log, success, error, close } = createLog();
const RootPath = join(__dirname, '..');

export default async function init({ cwd }) {
  try {
    log('Initializing...');
    
    const spawnOptions = { cwd, stdio: 'inherit' };
    spawnSync('pnpm', [
      '-w',
      'add',
      'vue@2',
    ], spawnOptions);
    const webpackDevDependencies = [
      'webpack',
      'webpack-cli',
      'webpack-merge',
      'clean-webpack-plugin',
      'mini-css-extract-plugin'
    ];
    const babelDevDependencies = ['@babel/core', '@babel/preset-env', 'babel-loader'];
    const tsDevDependencies = ['@types/node', 'typescript', 'ts-loader'];
    const cssDevDependencies = ['css-loader', 'postcss-loader', 'sass', 'sass-loader', 'style-loader'];
    const vueDevDependencies = ['vue-loader', 'vue-style-loader'];
    spawnSync('pnpm', [
      '-wD',
      'add',
      ...webpackDevDependencies,
      ...babelDevDependencies,
      ...tsDevDependencies,
      ...cssDevDependencies,
      ...vueDevDependencies,
    ], spawnOptions);
    await cp(join(RootPath, 'template', 'pmc.json'), join(cwd, 'pmc.json'));
    await cp(join(RootPath, 'template', 'tsconfig.json'), join(cwd, 'tsconfig.json'));
    await cp(join(RootPath, 'template', 'webpack-config'), join(cwd, 'webpack-config'), { recursive: true });
    success('Initialized!', { displace: true });
  } catch (e) {
    console.error(e);
  } finally {
    close();
    process.exit(0);
  }
}
