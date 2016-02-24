import test from 'tape';
import Immutable from 'immutable';

import { ref, Ref } from '../lib/ref';
import { Chain } from '../lib/chain';

test('Ref', t => {
  t.plan(3);

  const ref = new Ref('path');
  const listener = value => t.ok(value);

  t.equal(ref.key(), 'path');

  ref.addListener(listener);

  ref.emit(1);
  ref.emit(true);

  ref.removeListener(listener);

  ref.emit(false);

  ref.addListener(listener);

  t.end();
});

test('ref', t => {
  t.ok(Immutable.is(ref('/'), ref('/')));
  t.ok(Immutable.is(ref('/2'), ref('/2')));
  t.notOk(Immutable.is(ref('/1'), ref('/2')));

  t.ok(ref('/') instanceof Ref);
  t.ok(ref().bind(x => x) instanceof Chain);

  t.end();
});
