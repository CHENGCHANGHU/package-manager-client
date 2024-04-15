import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { rm } from 'node:fs/promises';
import { gracefullyExit, rewriteFile } from './utils.mjs';
import { createLog } from './print.mjs';

process.on('unhandledRejection', error => {
  console.error(error);
  gracefullyExit();
});

const RootPath = process.env.PWD;

const {
  positionals: packageNames,
} = parseArgs({
  allowPositionals: true,
  args: process.argv.slice(2),
  options: {},
});

const { log, success, error, close } = createLog();

if (packageNames.length === 0) {
  error('Please input at least one package name.');
  end();
}

try {
  for (const packageName of packageNames) {
    log(`${packageName} deleting...`);
    await rm(join(RootPath, 'packages', packageName), { recursive: true, force: true });
    const srcIndexFilePath = join(RootPath, 'src', 'index.ts');
    await rewriteFile(
      srcIndexFilePath,
      content => content.replaceAll(`export * from '@shopee/mh5-ui-${packageName}';\n`, '')
    );
    success(`${packageName} deleted!`, { displace: true });
  }
} catch (e) {
  console.error(e);
}

end();

function end() {
  close();
  process.exit(0);
}
