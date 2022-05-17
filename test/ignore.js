import { expect } from 'chai';
import fixturify from 'fixturify';
import tmp from 'tmp';

import { ignoreAll } from '..';

describe('ignore function', function () {
  it('should add file based ignores', async function () {
    const tmpobj = tmp.dirSync();
    fixturify.writeSync(tmpobj.name, {
      app: {
        'log.hbs': '{{log "hello"}}',
        'existing.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}{{debugger}}',
      },
    });

    await ignoreAll(tmpobj.name);

    const result = fixturify.readSync(tmpobj.name);

    expect(result).to.deep.equal({
      app: {
        'log.hbs': '{{! template-lint-disable no-log }}\n{{log "hello"}}',
        'existing.hbs': '{{! template-lint-disable no-debugger no-log }}\n{{log "hello"}}{{debugger}}',
      },
    });
  });
});
