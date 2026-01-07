import { readFileSync } from 'fs';
import { join } from 'path';
import getFiles from './lib/get-files.js';
import { Preprocessor } from 'content-tag';
import debugBase from 'debug';

let p = new Preprocessor();
const debug = debugBase('lint-to-the-future-ember-template');

export { default as ignoreAll } from './lib/ignore.js';

export const capabilities = ['filter-ignore'];

function getIgnores(template) {
  const firstLine = template.split('\n')[0];
  if (!firstLine.includes('template-lint-disable')) {
    return [];
  }

  // check the first line first, if that doesn't match, continue the check on the following lines
  const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/) || template.match(/template-lint-disable(.*?)(--)?\}\}/s);

  const ignoreRules = matched[1].replace('\n', '').split(' ')
    .map(item => item.trim())
    // remove trailing -- from when there is no gaps in comments
    .map(item => item.replace(/--$/, ''))
    .filter(item => item.length);
  return ignoreRules;
}

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

        ignoreRules = templates.map(template => getIgnores(template.contents.trim())).flat();
      } catch (error) {
        console.warn("Unable to parse file", filePath);
        debug(error);
        ignoreRules = [];
      }
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
