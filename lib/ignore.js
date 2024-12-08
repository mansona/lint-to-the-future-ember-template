import { createRequire } from 'module';
import { readFileSync } from "fs";
import { join } from "path";

import getFiles from "./get-files.js";
import ignoreError from './ignore-error.js';

const require = createRequire(import.meta.url);

// only passing the cwd in for testing purposes
export default async function ignoreAll({ filter } = {}, cwd = process.cwd()) {
  const files = getFiles(cwd, filter);

  let TemplateLinter;

  try {
    TemplateLinter = await import(require.resolve('ember-template-lint', { paths: [cwd]}));
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
