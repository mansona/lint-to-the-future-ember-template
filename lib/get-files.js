import walkSync from "walk-sync";
import { readFileSync } from 'fs';
import { join } from 'path';

export default function getFiles(cwd, filter) {
  let ignoreFile;

  try {
    ignoreFile = readFileSync(join(cwd, '.gitignore'), 'utf8')
      .split('\n')
      .filter((line) => line.length)
      .filter((line) => !line.startsWith('#'))
      // walkSync can't handle these
      .filter((line) => !line.startsWith('!'))
      .map((line) => line.replace(/^\//, ''))
      .map((line) => line.replace(/\/$/, '/*'));
  } catch {
    // noop
  }

  let globs = ['**/*.hbs', '**/*.gjs', '**/*.gts'];

  if (filter) {
    globs = [filter];
  }

  return walkSync(cwd, {
    globs,
    ignore: ignoreFile || ['**/node_modules/*'],
  });
}
