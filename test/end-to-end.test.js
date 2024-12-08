
import { Project } from 'fixturify-project';
import { execa } from 'execa';

import { expect, describe, beforeEach, it } from 'vitest';

describe('end-to-end test', function () {
  let project;

  beforeEach(async function() {
    project = new Project({
      files: {
        app: {
          'log.hbs': '{{log "hello"}}',
          'ignore-debugger.hbs': `{{! template-lint-disable no-debugger }}
          {{debugger}}
          {{log "hello"}}`,
        },
        'index.js': null,
      },
    });

    project.linkDevDependency('lint-to-the-future', { baseDir: process.cwd() });
    project.linkDevDependency('lint-to-the-future-ember-template', { baseDir: process.cwd(), resolveName: '.' });
    await project.write();
  });

  it('should be able to list', async function () {
    await execa({
      cwd: project.baseDir,
    })`lttf list -o outList.json`;

    project.readSync(project.baseDir);

    const parsedOutput = JSON.parse(project.files['outList.json']);

    expect(Object.entries(parsedOutput)[0][1]).to.deep.equal({
      "lint-to-the-future-ember-template": {
        "no-debugger": [
          "app/ignore-debugger.hbs"
        ]
      }
    });
  });
});
