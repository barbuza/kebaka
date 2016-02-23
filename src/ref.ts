import * as Immutable from 'immutable';

import {Bindable, AnyMapper} from './types';
import {ImmutableEmitter} from './immutable-emitter';
import {makeJSMapper} from './make-js-mapper'
import {Chain} from './chain';
import {Container} from './container';

type RefKey = string;

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
    return new Chain(new Container(this), Immutable.List.of(mapper));
  }

  bindJS(mapper:AnyMapper):Chain {
    return this.bind(makeJSMapper(mapper));
  }

  close() {
    super.close();

    refs = refs.remove(this.key());
  }

}

export function ref(path:string = '/'):Ref {
  const ref = new Ref(path);
  if (refs.has(ref.key())) {
    return refs.get(ref.key());
  }
  refs = refs.set(ref.key(), ref);
  return ref;
}
