import test from 'tape';

import { Ref, ref } from '../lib/ref';
import { Container } from '../lib/container'
import { wrap } from '../lib/wrap';

test('wrap', t => {
  t.equal(ref(), wrap(ref()));
  t.ok(wrap(ref()) instanceof Ref);
  t.ok(wrap([ref()]) instanceof Container);

  t.end();
});
