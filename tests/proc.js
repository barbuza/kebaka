import test from 'tape';
import Immutable from 'immutable';

import { proc } from '../es6/proc';
import { ref } from '../es6/ref';

test('proc', t => {
  t.plan(3);

  function* foo() {
    const a = yield ref('a');
    const b = yield ref('b');
    return { a, b };
  }

  let step = 0;
  let steps = [
    Immutable.Map({ a: 1, b: 2 }),
    Immutable.Map({ a: 2, b: 2 }),
    Immutable.Map({ a: 2, b: 3 })
  ];
  proc(foo).addListener(value => {
    t.ok(Immutable.is(value, steps[step]));
    step++;
  });

  ref('a').emit(1);
  ref('b').emit(2);
  ref('a').emit(2);
  ref('b').emit(3);
});
