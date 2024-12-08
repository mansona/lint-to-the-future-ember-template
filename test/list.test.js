import { list } from '../main.mjs';

import { expect, describe, it } from 'vitest';

describe('list function', function () {
  it('should output object with rules and files', function () {
    const result = list('./test/fixtures/list');
    expect(result).to.deep.equal({
      'no-curly-component-invocation': [
        'addon/templates/components/notification-container.hbs',
        'addon/templates/components/notification-message.hbs',
        'app/templates/application.hbs',
        'app/templates/author.hbs',
        'app/templates/error.hbs',
        'app/templates/post.hbs',
        'tests/dummy/app/templates/application.hbs',
      ],
      'no-action': [
        'addon/templates/components/notification-message.hbs',
        'tests/dummy/app/templates/application.hbs',
      ],
      'no-implicit-this': [
        'addon/templates/components/notification-message.hbs',
        'app/templates/application.hbs',
        'app/templates/author.hbs',
        'app/templates/error.hbs',
        'app/templates/post.hbs',
        'tests/dummy/app/templates/application.hbs',
      ],
      'no-invalid-interactive': ['addon/templates/components/notification-message.hbs'],
      'no-triple-curlies': ['addon/templates/components/notification-message.hbs'],
      'link-rel-noopener': [
        'app/templates/application.hbs',
        'app/templates/author.hbs',
        'tests/dummy/app/templates/application.hbs',
      ],
      'no-log': [
        'addon/templates/components/notification-thingy.hbs',
        'addon/templates/components/notification-yoke.hbs',
        'app/templates/error.hbs',
        'app/templates/fancy.gjs',
        'app/templates/not-so-fancy.gts',
      ],
      'no-unbalanced-curlies': ['tests/dummy/app/templates/application.hbs'],
      'require-button-type': ['tests/dummy/app/templates/application.hbs'],
      'require-input-label': ['tests/dummy/app/templates/application.hbs'],
    });
  });
});
