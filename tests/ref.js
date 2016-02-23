import test from 'tape';
import { ref, Ref } from '../lib/ref';
import { Chain } from '../lib/chain';

test('Ref', t => {
  t.plan(3);

  const ref = new Ref('path');
  const listener = () => t.pass();

  t.equal(ref.key(), 'path');
  t.equal(ref.listeners.size, 0);

  ref.addListener(listener);

  ref.emit(1);
  ref.emit(1);
  ref.emit(1);

  t.end();
});

test('ref', t => {
  t.ok(Object.is(ref('/'), ref('/')));
  t.ok(Object.is(ref('/2'), ref('/2')));
  t.notOk(Object.is(ref('/1'), ref('/2')));

  t.ok(ref('/') instanceof Ref);
  t.ok(ref().bind(x => x) instanceof Chain);

  t.end();
});
