const { readFileSync, writeFileSync } = require('fs');
const importCwd = require('import-cwd');
const walkSync = require('walk-sync');

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
    const matched = firstLine.match(/template-lint-disable(.*) --\}\}/);
    const existing = matched[1].split(' ')
      .map(item => item.trim())
      .filter(item => item.length);

    uniqueIds = [...new Set([...ruleIds, ...existing])];

    writeFileSync(filePath, file.replace(/^.*\n/, `{{!-- template-lint-disable ${uniqueIds.join(' ')} --}}\n`));
  } else {
    writeFileSync(filePath, `{{!-- template-lint-disable ${uniqueIds.join(' ')} --}}\n${file}`);
  }
}

export function ignoreAll() {
  const files = walkSync(process.cwd(), { globs: ['app/**/*.hbs', 'addon/**/*.hbs'] });

  const TemplateLinter = importCwd('ember-template-lint');
  const linter = new TemplateLinter();

  files.forEach(async (fileName) => {
    const template = readFileSync(fileName, {
      encoding: 'utf8',
    });

    let results = linter.verify({ source: template, filePath: fileName });

    // support ember-template-lint 2.x and 3.x
    if (results.then) {
      results = await results;
    }

    ignoreError(results, template, fileName);
  });
}

export function list() {
  const files = walkSync(process.cwd(), {
    globs: ['app/**/*.hbs', 'addon/**/*.hbs'],
  });

  const output = {};

  files.forEach((filePath) => {
    const file = readFileSync(filePath, 'utf8');
    const firstLine = file.split('\n')[0];
    if (!firstLine.includes('template-lint-disable')) {
      return;
    }

    const matched = firstLine.match(/template-lint-disable(.*) --\}\}/);
    const ignoreRules = matched[1].split(' ')
      .map(item => item.trim())
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
