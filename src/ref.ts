import {List} from 'immutable';

import {AnyMapper, RefKey, KeyPath} from './types';
import {Bindable} from './bindable';
import {ImmutableEmitter} from './immutable-emitter';
import makeJSMapper from './make-js-mapper';
import {Chain} from './chain';

export type RefMap = Immutable.Map<KeyPath, Ref>;

let refs = Immutable.Map<RefKey, Ref>();

export class Ref extends ImmutableEmitter implements Bindable {

  path:string;

  constructor(path:string) {
    super();
    this.path = path;
  }

  key():RefKey {
    return this.path;
  }

  bind(mapper:AnyMapper):Chain {
    return new Chain(this, List.of(mapper));
  }

  bindJS(mapper:AnyMapper):Chain {
    return this.bind(makeJSMapper(mapper));
  }

}

export function ref(path:string):Ref {
  const ref = new Ref(path);
  if (refs.has(ref.key())) {
    return refs.get(ref.key());
  }
  refs = refs.set(ref.key(), ref);
  return ref;
}
