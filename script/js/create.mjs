import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { cp, opendir, readFile, rename, writeFile } from 'node:fs/promises';
import readline from 'node:readline';
import { camelString, gracefullyExit } from './utils.mjs';
import { createLog } from './print.mjs';

process.on('unhandledRejection', error => {
  console.error(error);
  gracefullyExit();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// console.log(process);

const RootPath = process.env.PWD;
// console.log(process.argv);
const {
  values: {
    name,
  },
  positionals: packageNames,
} = parseArgs({
  allowPositionals: true,
  args: process.argv.slice(2),
  options: {
    // name: {
    //   type: 'string',
    //   short: 'n',
    //   multiple: true,
    // },
  },
});

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(0);
}

async function main() {
  const { log, success, error, close } = createLog();
  log(`Start creating packages: ${packageNames.join(', ')}`);
  // console.log(rl.getCursorPos());
  for (const packageName of packageNames) {
    log(packageName + ' creating...');

    const camelPackageName = camelString(packageName);
    if (/^[^a-zA-Z]/.test(packageName)) {
      error(packageName + ' failed! Package name cannot be started with a non-word character.', { displace: true });
      continue;
    }
    const destinationPath = join(RootPath, 'packages', packageName);

    await cp(join(RootPath, 'package-template'), destinationPath, { recursive: true });
  
    let direntQueue = [];
    const dir = await opendir(destinationPath);
    for await (const dirent of dir) {
      direntQueue.push({
        parentPath: destinationPath,
        dirent,
      });
    }
    while (direntQueue.length !== 0) {
      const tempQueue = [];
      for (const { parentPath, dirent } of direntQueue) {
        if (dirent.isDirectory()) {
          const childDirPath = join(parentPath, dirent.name);
          const childDir = await opendir(childDirPath);
          for await (const dirent of childDir) {
            tempQueue.push({
              parentPath: childDirPath,
              dirent,
            });
          }
          continue;
        }
        const filePath = join(parentPath, dirent.name);
        // const content = await readFile(filePath, { encoding: 'utf-8', flag: 'r' });
        // const replacedContent = content
        //   .replaceAll(/<!-- package-name -->/g, packageName)
        //   .replaceAll(/<!-- camel-package-name -->/g, camelPackageName);
        // await writeFile(filePath, replacedContent, { encoding: 'utf-8', flag: 'w' });
        await rewriteFile(filePath, content => content
          .replaceAll(/<!-- package-name -->/g, packageName)
          .replaceAll(/<!-- camel-package-name -->/g, camelPackageName));
        if (dirent.name === 'Component.vue') {
          await rename(filePath, join(parentPath, camelPackageName + '.vue'));
        }
      }
      direntQueue = tempQueue;
    }

    const srcIndexFilePath = join(RootPath, 'src', 'index.ts');
    await rewriteFile(srcIndexFilePath, content => {
      return `${content}export * from '@shopee/mh5-ui-${packageName}';\n`
    });

    success(packageName + ' created!', { displace: true });
  }

  close();
  process.exit(0);
}

async function rewriteFile(path, rewrite = v => v) {
  const content = await readFile(path, { encoding: 'utf-8', flag: 'r' });
  const rewrittenContent = rewrite(content);
  await writeFile(path, rewrittenContent, { encoding: 'utf-8', flag: 'w' });
}
