import * as Immutable from 'immutable';

import {Bindable, Mapper, Listener} from './types';
import {makeJSMapper} from './make-js-mapper'
import {Chain} from './chain';

type RefKey = string;

let refValues = Immutable.Map<RefKey, any>();
let refListeners = Immutable.Map<RefKey, Immutable.List<Listener>>();

export class Ref implements Bindable {

  protected path:string;

  constructor(path:string) {
    this.path = path;
  }

  protected key():RefKey {
    return this.path;
  }

  addListener(listener:Listener):this {
    if (!refListeners.has(this.key())) {
      refListeners = refListeners.set(
        this.key(),
        Immutable.List.of(listener)
      );
    } else {
      refListeners = refListeners.update(
        this.key(),
        listeners => listeners.push(listener)
      );
    }
    if (refValues.has(this.key())) {
      listener(refValues.get(this.key()));
    }
    return this;
  }

  removeListener(listener:Listener):this {
    refListeners = refListeners.update(
      this.key(),
      listeners => listeners.remove(listeners.indexOf(listener))
    );
    if (refListeners.get(this.key()).isEmpty()) {
      refListeners = refListeners.remove(this.key());
      refValues = refValues.remove(this.key());
    }
    return this;
  }

  emit(value:any) {
    if (!refValues.has(this.key()) || !Immutable.is(refValues.get(this.key()), value)) {
      const listeners = refListeners.get(this.key());
      if (listeners) {
        refValues = refValues.set(this.key(), value);
        listeners.forEach(listener => listener(value));
      }
    }
  }

  bind(mapper:Mapper):Chain {
    return new Chain(this, Immutable.List.of(mapper));
  }

  bindJS(mapper:Mapper):Chain {
    return this.bind(makeJSMapper(mapper));
  }

  equals(other:Ref):boolean {
    return (other instanceof Ref) && Immutable.is(this.key(), other.key());
  }

}

export function ref(path:string = '/'):Ref {
  return new Ref(path);
}
