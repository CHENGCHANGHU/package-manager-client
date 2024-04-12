#!/usr/bin/env node
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import create from './create.mjs';
import init from './init.mjs';
import _delete from './delete.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RootPath = join(__dirname, '..');
const { env: { PWD } } = process;

const {
  values,
  positionals: [subcommand, ...params],
} = parseArgs({
  allowPositionals: true,
  args: process.argv.slice(2),
  options: {
    // create: {
    //   type: 'string',
    //   short: 'c',
    //   multiple: true,
    // }
  },
});

console.log(values);
console.log(subcommand, params);

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(0);
}

async function main() {
  switch (subcommand) {
    case 'init':
      await init({ cwd: PWD });
      break;
    case 'create':
      await create({ params, cwd: PWD });
      break;
    case 'delete':
      await _delete({ params, cwd: PWD });
      break;
  }
}
