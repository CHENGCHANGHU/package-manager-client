import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { rm, readFile } from 'node:fs/promises';
import { rewriteFile } from './utils.mjs';
import { createLog } from './print.mjs';

const { log, success, error, close } = createLog();

export default async function _delete({ params, cwd }) {
  try {
    const {
      values: { configFilePath },
      positionals: packageNames,
    } = parseArgs({ allowPositionals: true, args: params, options: {
      configFilePath: { type: 'string', short: 'c', default: 'pmc.json' },
    } });
    
    if (packageNames.length === 0) {
      throw new Error('Please input at least one package name.');
    }

    const config = JSON.parse(await readFile(join(cwd, configFilePath), { encoding: 'utf-8', flag: 'r' }));

    for (const packageName of packageNames) {
      log(`${packageName} deleting...`);
      await rm(join(cwd, ...config.packagePath.split('/'), packageName), { recursive: true, force: true });

      if (config.importer) {
        const srcIndexFilePath = join(cwd, ...config.importer.split('/'));
        await rewriteFile(
          srcIndexFilePath,
          content => content.replaceAll(`export * from '@${config.scope}/${packageName}';\n`, '')
        );
      }
      success(`${packageName} deleted!`, { displace: true });
    }
  } catch (e) {
    console.error(e);
  } finally {
    close();
    process.exit(0);
  }
}
