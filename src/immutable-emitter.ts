import * as Immutable from 'immutable';

import {Emitter, Listener} from './types';

let open = 0;
const NO_VALUE = {};

export class ImmutableEmitter implements Emitter {

  protected previouslyEmitted:any = NO_VALUE;
  protected listeners:Immutable.List<Listener> = Immutable.List<Listener>();

  addListener(listener:Listener):this {
    const shouldOpen = this.listeners.isEmpty();
    this.listeners = this.listeners.push(listener);
    if (!Immutable.is(this.previouslyEmitted, NO_VALUE)) {
      listener(this.previouslyEmitted);
    }
    if (shouldOpen) {
      this.open();
    }
    return this;
  }

  removeListener(listener:Listener):this {
    this.listeners = this.listeners.remove(this.listeners.indexOf(listener));
    if (this.listeners.isEmpty()) {
      this.close();
    }
    return this;
  }

  emit(value:any) {
    if (!Immutable.is(this.previouslyEmitted, value)) {
      this.previouslyEmitted = value;
      this.listeners.forEach(listener => listener(value));
    }
  }

  protected open() {
    console.log('open', ++open, (<any>this.constructor).name);
  }

  protected close() {
    console.log('close', --open, (<any>this.constructor).name);
    this.previouslyEmitted = NO_VALUE;
  }

}
