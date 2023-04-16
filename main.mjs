import { readFileSync, writeFileSync } from 'fs';
import importCwd from 'import-cwd';
import walkSync from 'walk-sync';
import { join } from 'path';

function getFiles(cwd) {
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
  } catch (e) {
    // noop
  }

  return walkSync(cwd, {
    globs: ['**/*.hbs'],
    ignore: ignoreFile || ['**/node_modules/*'],
  });
}

function ignoreError(errorInput, file, filePath) {
  let errors = errorInput.results ?? errorInput;

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
    uniqueIds.sort((a, b) => a.localeCompare(b));

    writeFileSync(filePath, file.replace(/^.*\n/, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n`));
  } else {
    uniqueIds.sort((a, b) => a.localeCompare(b));
    writeFileSync(filePath, `{{! template-lint-disable ${uniqueIds.join(' ')} }}\n${file}`);
  }
}

// only passing the cwd in for testing purposes
export async function ignoreAll(cwd = process.cwd()) {
  const files = getFiles(cwd);

  let TemplateLinter;

  try {
    TemplateLinter = await import(join(process.cwd(), 'node_modules', 'ember-template-lint', 'lib', 'index.js'));
  } catch (err) {
    console.error({err});
  }

  const linter = new TemplateLinter.default();

  for (const fileName of files) {
    const template = readFileSync(join(cwd, fileName), {
      encoding: 'utf8',
    });

    let results = linter.verify({
      source: template,
      filePath: fileName,
      // workaround for https://github.com/ember-template-lint/ember-template-lint/issues/2128
      moduleId: fileName.replace(/\.[^/\\.]+$/, '')
    });


    // support ember-template-lint 2.x and 3.x
    if (results.then) {
      results = await results;
    }

    ignoreError(results, template, join(cwd, fileName));
  }
}

export function list(directory) {
  // this is only used for internal testing, lint-to-the-future never passes a
  // directory
  const cwd = directory || process.cwd();

  const files = getFiles(cwd);

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
