import test from 'tape';
import Immutable from 'immutable';

import { Chain } from '../lib/chain';
import { ref } from '../lib/ref';
import { wrap } from '../lib/wrap';

test('Chain', t => {
  t.plan(5);

  const id = x => x;
  t.ok(Immutable.is(ref().bind(id).source, ref()));

  t.ok(Immutable.is(ref().bind(id).bind(id), ref().bind(id).bind(id)));

  const okListener = t.ok.bind(t);
  const notOkListener = t.notOk.bind(t);

  const c = ref().bind(id);

  c.addListener(okListener);

  ref().emit(true);

  c.removeListener(okListener);

  c.addListener(notOkListener);

  ref().emit(false);

  const testChain = wrap({
    a: ref('/a'),
    b: ref('/b')
  }).bindJS(({ a, b }) => ({ a, b, c: ref('/c') }))
    .bindJS(({ a, b, c }) => a + b + c);

  testChain.addListener(value => t.equal(value, 6));

  ref('/a').emit(1);
  ref('/b').emit(2);
  ref('/c').emit(3);

  t.end();
});
