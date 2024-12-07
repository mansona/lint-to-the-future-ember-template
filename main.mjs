import { readFileSync } from 'fs';
import { join } from 'path';
import getFiles from './lib/get-files.js';
import { Preprocessor } from 'content-tag';
let p = new Preprocessor();

export { default as ignoreAll } from './lib/ignore.js';

export const capabilities = ['filter-ignore'];

function getIgnores(template) {
  const firstLine = template.split('\n')[0];
  if (!firstLine.includes('template-lint-disable')) {
    return [];
  }

  const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/);

  const ignoreRules = matched[1].split(' ')
    .map(item => item.trim())
    // remove trailing -- from when there is no gaps in comments
    .map(item => item.replace(/--$/, ''))
    .filter(item => item.length);
  return ignoreRules;
}

export function list(directory) {
  // this is only used for internal testing, lint-to-the-future never passes a
  // directory
  const cwd = directory || process.cwd();

  const files = getFiles(cwd);

  const output = {};

  files.forEach((filePath) => {
    const file = readFileSync(join(cwd, filePath), 'utf8');

    let ignoreRules;

    if (filePath.endsWith('.gjs') || filePath.endsWith('.gts')) {
      let templates = p.parse(file);

      ignoreRules = templates.map(template => getIgnores(template.contents.trim())).flat();
    } else {
      ignoreRules = getIgnores(file);
    }


    ignoreRules.forEach((rule) => {
      if (output[rule]) {
        output[rule].push(filePath);
      } else {
        output[rule] = [filePath];
      }
    });
  });

  return output;
}
