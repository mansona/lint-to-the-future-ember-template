import { expect } from 'chai';
import { Project } from 'fixturify-project';

import { ignoreAll } from '../main.mjs';

describe('ignore function', function () {
  let project;

  beforeEach(async function() {
    project = new Project({
      files: {
        app: {
          'log.hbs': '{{log "hello"}}',
          'existing.hbs': '{{! template-lint-disable no-debugger }}\n{{log "hello"}}{{debugger}}',
          'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
          'existing-wrong-order-do-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
          'ignore-me.hbs': '{{log "ignored"}}',
        },
        'package.json': `{
          "devDependencies": {
            "ember-template-lint": "*"
          }
        }`,
        'index.js': null,
      },
    });

    project.linkDevDependency('ember-template-lint', { baseDir: process.cwd() });
    await project.write();
  });

  it('should add file based ignores', async function () {
    await ignoreAll({}, project.baseDir);

    project.readSync(project.baseDir);

    expect(project.files).to.deep.equal({
      app: {
        'log.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}',
        'existing.hbs': '{{! template-lint-disable no-debugger no-log }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-do-change.hbs': '{{! template-lint-disable link-rel-noopener no-debugger no-log }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
        'ignore-me.hbs': '{{log "ignored"}}',
      },
    });
  });

  it('should only ignore files specified by the filter', async function() {
    await ignoreAll({
      filter: 'app/log.hbs'
    }, project.baseDir);

    project.readSync(project.baseDir);

    expect(project.files).to.deep.equal({
      app: {
        'log.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}',

        // the following are the same as the input of the project from beforeEach
        'existing.hbs': '{{! template-lint-disable no-debugger }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-do-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
        'ignore-me.hbs': '{{log "ignored"}}',
      },
    });
  })
});
