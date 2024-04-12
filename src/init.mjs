import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { cp, opendir, readFile, rename, writeFile } from 'node:fs/promises';
import readline from 'node:readline';
import { camelString, gracefullyExit, rewriteFile } from './utils.mjs';
import { createLog } from './print.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { log, success, error, close } = createLog();
const RootPath = join(__dirname, '..');

export default async function init({ cwd }) {
  try {
    log('Initializing...');
    await cp(join(RootPath, 'pmc-template.json'), join(cwd, 'pmc.json'));
    await cp(join(RootPath, 'webpack-config-template'), join(cwd, 'webpack-config'), { recursive: true });
    success('Initialized!', { displace: true });
  } catch (e) {
    console.error(e);
  } finally {
    close();
    process.exit(0);
  }
}
