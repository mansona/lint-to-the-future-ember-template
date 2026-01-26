import { readFileSync } from 'fs';
import { join } from 'path';
import getFiles from './lib/get-files.js';
import { Preprocessor } from 'content-tag';
import debugBase from 'debug';
import { getExistingIgnores } from './lib/utils.js';

let p = new Preprocessor();
const debug = debugBase('lint-to-the-future-ember-template');

export { default as ignoreAll } from './lib/ignore.js';

export const capabilities = ['filter-ignore'];

export async function list(directory) {
  // this is only used for internal testing, lint-to-the-future never passes a
  // directory
  const cwd = directory || process.cwd();

  const files = await getFiles(cwd);

  const output = {};

  files.forEach((filePath) => {
    const file = readFileSync(join(cwd, filePath), 'utf8');

    let ignoreRules;

    if (filePath.endsWith('.gjs') || filePath.endsWith('.gts')) {
      try {
      let templates = p.parse(file);

      ignoreRules = templates.map(template => getExistingIgnores(template.contents.trim())).flat();
      } catch (error) {
        console.warn("Unable to parse file", filePath);
        debug(error);
        ignoreRules = [];
      }
    } else {
      ignoreRules = getExistingIgnores(file);
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
