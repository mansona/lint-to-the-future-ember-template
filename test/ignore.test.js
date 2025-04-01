import { Project } from 'fixturify-project';
import { expect, describe, beforeEach, it } from 'vitest';
import { execa } from 'execa';

describe('ignore function', function () {
  let project;

  beforeEach(async function() {
    project = new Project({
      files: {
        '.template-lintrc.js': `module.exports = {
          extends: 'recommended',
          ignore: ['app/ignore-me'],
        };`,
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

    project.linkDevDependency('lint-to-the-future', { baseDir: process.cwd() });
    project.linkDevDependency('lint-to-the-future-ember-template', { baseDir: process.cwd(), resolveName: '.' });
    project.linkDevDependency('ember-template-lint', { baseDir: process.cwd() });
    await project.write();
  });

  it('should add file based ignores', async function () {
    await execa({
      cwd: project.baseDir,
    })`lttf ignore`;

    project.readSync(project.baseDir);

    expect(project.files.app).to.deep.equal({
      'log.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}',
      'existing.hbs': '{{! template-lint-disable no-debugger no-log }}\n{{log "hello"}}{{debugger}}',
      'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
      'existing-wrong-order-do-change.hbs': '{{! template-lint-disable link-rel-noopener no-debugger no-log }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
      'ignore-me.hbs': '{{log "ignored"}}',
    });
  });

  it('should only ignore files specified by the filter', async function() {
    await execa({
      cwd: project.baseDir,
    })`lttf ignore --filter app/log.hbs`;

    project.readSync(project.baseDir);

    expect(project.files.app).to.deep.equal({
      'log.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}',
      // the following are the same as the input of the project from beforeEach
      'existing.hbs': '{{! template-lint-disable no-debugger }}\n{{log "hello"}}{{debugger}}',
      'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
      'existing-wrong-order-do-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
      'ignore-me.hbs': '{{log "ignored"}}',
    });
  })

  it('should add ignore declarations at the top of template blocks', async function() {
    project = new Project({
      files: {
        '.template-lintrc.js': `module.exports = {
          extends: 'recommended',
          ignore: ['app/ignore-me'],
        };`,
        app: {
          'template.gjs': `import RouteTemplate from 'ember-route-template';

export default RouteTemplate(<template>
  {{log "hello"}}
</template>);`,
        },
        'package.json': `{
          "devDependencies": {
            "ember-template-lint": "*"
          }
        }`,
        'index.js': null,
      },
    });

    project.linkDevDependency('lint-to-the-future', { baseDir: process.cwd() });
    project.linkDevDependency('lint-to-the-future-ember-template', { baseDir: process.cwd(), resolveName: '.' });
    project.linkDevDependency('ember-template-lint', { baseDir: process.cwd() });
    await project.write();

    await execa({
      cwd: project.baseDir,
    })`lttf ignore`;

    project.readSync(project.baseDir);

    expect(project.files.app['template.gjs']).to.equal(`import RouteTemplate from 'ember-route-template';

export default RouteTemplate(<template>
  {{! template-lint-disable no-log }}
  {{log "hello"}}
</template>);`);
  });

  it('should add ignore declarations at the top of multiple template blocks', async function() {
    project = new Project({
      files: {
        '.template-lintrc.js': `module.exports = {
          extends: 'recommended',
          ignore: ['app/ignore-me'],
        };`,
        app: {
          'multi-template.gjs': `import Component from '@glimmer/component';

const FirstTemplate = <template>
  {{log "first template"}}
</template>;

const SecondTemplate = <template>
  Inside Second Template
</template>;

export default class MyComponent extends Component {
  <template>
    <FirstTemplate />
    <SecondTemplate />
    {{log "MyComponent template"}}
  </template>
}`,
        },
        'package.json': `{
          "devDependencies": {
            "ember-template-lint": "*"
          }
        }`,
        'index.js': null,
      },
    });

    project.linkDevDependency('lint-to-the-future', { baseDir: process.cwd() });
    project.linkDevDependency('lint-to-the-future-ember-template', { baseDir: process.cwd(), resolveName: '.' });
    project.linkDevDependency('ember-template-lint', { baseDir: process.cwd() });
    await project.write();

    await execa({
      cwd: project.baseDir,
    })`lttf ignore`;

    project.readSync(project.baseDir);

    expect(project.files.app['multi-template.gjs']).to.equal(`import Component from '@glimmer/component';

const FirstTemplate = <template>
  {{! template-lint-disable no-log }}
  {{log "first template"}}
</template>;

const SecondTemplate = <template>
  Inside Second Template
</template>;

export default class MyComponent extends Component {
  <template>
    {{! template-lint-disable no-log }}
    <FirstTemplate />
    <SecondTemplate />
    {{log "MyComponent template"}}
  </template>
}`);
  });

  it('should not add ignore declarations for Logger components but should for regular elements', async function() {
    project = new Project({
      files: {
        '.template-lintrc.js': `module.exports = {
          extends: 'recommended',
        };`,
        app: {
          'logger-test.gjs': `export const Y = <template>
  <Logger as |log|>
    {{log "foo"}}
  </Logger>
</template>;

export const X = <template>
  <div>
    {{log "foo"}}
  </div>
</template>;`,
        },
        'package.json': `{
          "devDependencies": {
            "ember-template-lint": "*"
          }
        }`,
        'index.js': null,
      },
    });

    project.linkDevDependency('lint-to-the-future', { baseDir: process.cwd() });
    project.linkDevDependency('lint-to-the-future-ember-template', { baseDir: process.cwd(), resolveName: '.' });
    project.linkDevDependency('ember-template-lint', { baseDir: process.cwd() });
    await project.write();

    await execa({
      cwd: project.baseDir,
    })`lttf ignore`;

    project.readSync(project.baseDir);

    expect(project.files.app['logger-test.gjs']).to.equal(`export const Y = <template>
  <Logger as |log|>
    {{log "foo"}}
  </Logger>
</template>;

export const X = <template>
  {{! template-lint-disable no-log }}
  <div>
    {{log "foo"}}
  </div>
</template>;`);
  });
});
