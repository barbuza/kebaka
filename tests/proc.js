import test from 'tape';
import Immutable from 'immutable';

import { proc } from '../es6/proc';
import { ref } from '../es6/ref';

test('proc', t => {
  t.plan(3);

  function* foo() {
    let items = yield { a: ref('a'), b: ref('b') };
    items = items.set('c', yield ref('c'));
    return items;
  }

  let step = 0;
  let steps = [
    Immutable.Map({ a: 1, b: 2, c: 'c' }),
    Immutable.Map({ a: 2, b: 2, c: 'c' }),
    Immutable.Map({ a: 2, b: 3, c: 'c' })
  ];
  proc(foo).addListener(value => {
    t.ok(Immutable.is(value, steps[step]));
    step++;
  });

  ref('a').emit(1);
  ref('b').emit(2);
  ref('c').emit('c');
  ref('a').emit(2);
  ref('b').emit(3);
});
