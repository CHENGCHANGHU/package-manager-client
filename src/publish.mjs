import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';
import { opendir, readFile } from 'node:fs/promises';
import { gracefullyExit, rewriteFile } from './utils.mjs';
import { createLog } from './print.mjs';
import Version from './version.mjs';

process.on('unhandledRejection', error => {
  console.error(error);
  gracefullyExit();
});

const RootPath = process.env.PWD;

const {
  values: { all, major, minor, patch, preid, beta },
  positionals: packageNames,
} = parseArgs({
  allowPositionals: true,
  args: process.argv.slice(2),
  options: {
    all: { type: 'boolean', short: 'a', default: false },
    major: { type: 'boolean', short: 'M', default: false },
    minor: { type: 'boolean', short: 'm', default: false },
    patch:  { type: 'boolean',short: 'p',default: false },
    preid: { type: 'string', default: '' },
    beta: { type: 'boolean', short: 'b', default: false },
  },
});

const { log, success, error, close } = createLog();

if (!(major || minor || patch || beta)) {
  error('Please specify which version to update!');
  end();
}

try {
  const spawnOptions = { cwd: RootPath, stdio: 'inherit' };
  const tags = [];
  let candidatePackageNames = [];

  if (all) {
    const dir = await opendir(join(RootPath, 'packages'));
    for await (const dirent of dir) {
      candidatePackageNames.push(dirent.name);
    }
  } else if (packageNames.length === 0) {
    error('Please input at least one package name to published!');
    end();
  } else {
    candidatePackageNames = packageNames;
  }

  candidatePackageNames.forEach(async name => {
    const packageJSONFilePath = join(RootPath, 'packages', name, 'package.json');
    await rewriteFile(packageJSONFilePath, content => {
      const { name, version } = JSON.parse(content);
      const upperVersion = Version.upgrade(Version.parse(version), { major, minor, patch, preid, beta });
      const serializedVersion = Version.serialize(upperVersion);
      tags.push(`${name}@${serializedVersion}`);
      return content.replace(`"version": "${version}"`, `"version": "${serializedVersion}"`);
    });
  });

  const rootPackageJSONFilePath = join(RootPath, 'package.json');
  await rewriteFile(rootPackageJSONFilePath, content => {
    const { name, version } = JSON.parse(content);
    const upperVersion = Version.upgrade(Version.parse(version), { major, minor, patch, preid, beta });
    const serializedVersion = Version.serialize(upperVersion);
    tags.push(`${name}@${serializedVersion}`);
    return content.replace(`"version": "${version}"`, `"version": "${serializedVersion}"`);
  });

  spawnSync('pnpm', ['-r', 'run', 'build'], spawnOptions);
  spawnSync('pnpm', ['-w', 'run', 'build'], spawnOptions);
  spawnSync('git', ['add', '.'], spawnOptions);
  spawnSync('git', ['commit', '-m', tags.join('\n')], spawnOptions);
  tags.forEach(tag => spawnSync('git', ['tag', tag], spawnOptions));
  spawnSync('git', ['push', 'origin', 'master'], spawnOptions);
  spawnSync('git', ['push', 'origin', '--tags'], spawnOptions);
  spawnSync('pnpm', ['publish', '-r'], spawnOptions);
  success(tags.join(' published!\n') + ' published!');
} catch (e) {
  console.error(e);
}

end();

function end() {
  close();
  process.exit(0);
}
