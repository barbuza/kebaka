import test from 'tape';
import Immutable from 'immutable';

import { Ref, ref } from '../lib/ref';
import { Container } from '../lib/container'
import { wrap } from '../lib/wrap';

test('wrap', t => {
  t.ok(Immutable.is(ref(), wrap(ref())));
  t.ok(Immutable.is(wrap({ a: ref() }), wrap({ a: ref() })));
  t.ok(wrap(ref()) instanceof Ref);
  t.ok(wrap([ref()]) instanceof Container);

  t.end();
});
