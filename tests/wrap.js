import test from 'tape';
import Immutable from 'immutable';

import { Ref, ref } from '../es6/ref';
import { Container } from '../es6/container'
import { wrap } from '../es6/wrap';

test('wrap', t => {
  t.ok(Immutable.is(ref(), wrap(ref())));
  t.ok(Immutable.is(wrap({ a: ref() }), wrap({ a: ref() })));
  t.ok(wrap(ref()) instanceof Ref);
  t.ok(wrap([ref()]) instanceof Container);

  t.end();
});
