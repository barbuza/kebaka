import test from 'tape';
import Immutable from 'immutable';

import { Chain } from '../lib/chain';
import { ref } from '../lib/ref';

test('Chain', t => {
  t.plan(4);

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

  t.end();
});
