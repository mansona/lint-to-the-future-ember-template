import { readFileSync, writeFileSync } from 'fs';
import importCwd from 'import-cwd';
import walkSync from 'walk-sync';
import { join } from 'path';

function ignoreError(errors, file, filePath) {
  const ruleIds = errors
    .filter(error => error.severity === 2)
    .map(error => error.rule);

  let uniqueIds = [...new Set(ruleIds)];

  if (!uniqueIds.length) {
    // no errors to ignore
    return;
  }

  const firstLine = file.split('\n')[0];

  if (firstLine.includes('template-lint-disable')) {
    const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/);
    const existing = matched[1].split(' ')
      .map(item => item.trim())
      .filter(item => item.length);

    uniqueIds = [...new Set([...ruleIds, ...existing])];

    writeFileSync(filePath, file.replace(/^.*\n/, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n`));
  } else {
    writeFileSync(filePath, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n${file}`);
  }
}

// only passing the cwd in for testing purposes
export async function ignoreAll(cwd = process.cwd()) {
  const files = walkSync(cwd, { globs: ['app/**/*.hbs', 'addon/**/*.hbs', 'tests/**/*.hbs'] });

  const TemplateLinter = importCwd('ember-template-lint');
  const linter = new TemplateLinter();

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of files) {
    const template = readFileSync(join(cwd, fileName), {
      encoding: 'utf8',
    });

    let results = linter.verify({ source: template, filePath: fileName });

    // support ember-template-lint 2.x and 3.x
    if (results.then) {
      // eslint-disable-next-line no-await-in-loop
      results = await results;
    }

    ignoreError(results, template, join(cwd, fileName));
  }
}

export function list(directory) {
  // this is only used for internal testing, lint-to-the-future never passes a
  // directory
  const cwd = directory || process.cwd();

  const files = walkSync(cwd, {
    globs: ['app/**/*.hbs', 'addon/**/*.hbs', 'tests/**/*.hbs'],
  });

  const output = {};

  files.forEach((filePath) => {
    const file = readFileSync(join(cwd, filePath), 'utf8');
    const firstLine = file.split('\n')[0];
    if (!firstLine.includes('template-lint-disable')) {
      return;
    }

    const matched = firstLine.match(/template-lint-disable(.*)(--)?\}\}/);

    const ignoreRules = matched[1].split(' ')
      .map(item => item.trim())
      // remove trailing -- from when there is no gaps in comments
      .map(item => item.replace(/--$/, ''))
      .filter(item => item.length);

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
