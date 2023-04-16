import { expect } from 'chai';
import fixturify from 'fixturify';
import tmp from 'tmp';

import { ignoreAll } from '../main.mjs';

describe('ignore function', function () {
  it('should add file based ignores', async function () {
    const tmpobj = tmp.dirSync();
    fixturify.writeSync(tmpobj.name, {
      app: {
        'log.hbs': '{{log "hello"}}',
        'existing.hbs': '{{! template-lint-disable no-debugger }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-do-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
        'ignore-me.hbs': '{{log "ignored"}}',
      },
    });

    await ignoreAll(tmpobj.name);

    const result = fixturify.readSync(tmpobj.name);

    expect(result).to.deep.equal({
      app: {
        'log.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}',
        'existing.hbs': '{{! template-lint-disable no-debugger no-log }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-dont-change.hbs': '{{! template-lint-disable no-log no-debugger }}\n{{log "hello"}}{{debugger}}',
        'existing-wrong-order-do-change.hbs': '{{! template-lint-disable link-rel-noopener no-debugger no-log }}\n{{log "hello"}}{{debugger}} <a href="http://google.com" target="_blank">Go google it</a>',
        'ignore-me.hbs': '{{log "ignored"}}',
      },
    });
  });
});
