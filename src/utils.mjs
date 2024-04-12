import { readFile, writeFile } from 'node:fs/promises';

export function gracefullyExit() {
  process.kill(process.pid, 'SIGTERM');
}

export function camelString(str) {
  return str
    .replaceAll(/(\-+(\w))/g, (m_match, m_with_dash, m_first_char) => m_first_char.toUpperCase())
    .replace(/^(\w)/, m_match => m_match.toUpperCase());
}

export async function rewriteFile(path, rewrite = v => v) {
  const content = await readFile(path, { encoding: 'utf-8', flag: 'r' });
  const rewrittenContent = rewrite(content);
  await writeFile(path, rewrittenContent, { encoding: 'utf-8', flag: 'w' });
}
