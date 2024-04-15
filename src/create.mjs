import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { cp, opendir, readFile, rename } from 'node:fs/promises';
import { camelString, rewriteFile } from './utils.mjs';
import { createLog } from './print.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { log, success, error, close } = createLog();
const RootPath = join(__dirname, '..');

export default async function create({ params, cwd }) {
  try {
    const {
      values: { configFilePath },
      positionals: packageNames,
    } = parseArgs({ args: params, allowPositionals: true, options: {
      configFilePath: { type: 'string', short: 'c', default: 'pmc.json' },
    } });
    const config = JSON.parse(await readFile(join(cwd, configFilePath), { encoding: 'utf-8', flag: 'r' }));
  
    log(`Start creating packages: ${packageNames.join(', ')}`);

    for (const packageName of packageNames) {
      log(packageName + ' creating...');

      const camelPackageName = camelString(packageName);
      if (/^[^a-zA-Z]/.test(packageName)) {
        error(packageName + ' failed! Package name cannot be started with a non-word character.', { displace: true });
        continue;
      }
      const destinationPath = join(cwd, ...config.packagePath.split('/'), packageName);
  
      await cp(join(RootPath, 'template', 'package'), destinationPath, { recursive: true });
    
      let direntQueue = [];
      const dir = await opendir(destinationPath);
      for await (const dirent of dir) {
        direntQueue.push({ parentPath: destinationPath, dirent });
      }
      while (direntQueue.length !== 0) {
        const tempQueue = [];
        for (const { parentPath, dirent } of direntQueue) {
          if (dirent.isDirectory()) {
            const childDirPath = join(parentPath, dirent.name);
            const childDir = await opendir(childDirPath);
            for await (const dirent of childDir) {
              tempQueue.push({ parentPath: childDirPath, dirent });
            }
            continue;
          }
          const filePath = join(parentPath, dirent.name);
          await rewriteFile(filePath, content => content
            .replaceAll(/<!-- scope-package-name -->/g, `@${config.scope}/${packageName}`)
            .replaceAll(/<!-- package-name -->/g, packageName)
            .replaceAll(/<!-- camel-package-name -->/g, camelPackageName));
          if (dirent.name === 'Component.vue') {
            await rename(filePath, join(parentPath, camelPackageName + '.vue'));
          }
        }
        direntQueue = tempQueue;
      }
  
      if (config.importer) {
        const srcIndexFilePath = join(cwd, ...config.importer.split('/'));
        await rewriteFile(srcIndexFilePath, content =>
          `${content}export * from '@${config.scope}/${packageName}';\n`);
      }

      success(packageName + ' created!', { displace: true });
    }
  } catch (e) {
    console.error(e);
  } finally {
    close();
    process.exit(0);
  }
}
