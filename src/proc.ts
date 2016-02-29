import * as Immutable from 'immutable';
import asap from 'asap';

import {wrap} from './wrap';
import {Emitter, Gen, GenIterator, Listener} from './types';
import {ImmutableEmitter} from './immutable-emitter';

const noDeps:Immutable.List<Emitter> = Immutable.List<Emitter>();

export class Proc extends ImmutableEmitter {

  protected gen:GenIterator;
  protected fn:Gen;
  protected step:number = 0;
  protected values:Immutable.Map<number, any> = Immutable.Map<number, any>();
  protected deps:Immutable.List<Emitter> = noDeps;
  protected stepListeners:Immutable.Map<number, Listener> = Immutable.Map<number, Listener>();

  constructor(fn:Gen) {
    super();
    this.fn = fn;
  }

  protected stepListener(index:number):Listener {
    if (!this.stepListeners.has(index)) {
      this.stepListeners = this.stepListeners.set(index, this.update.bind(this, index));
    }
    return this.stepListeners.get(index);
  }

  protected update(step:number, value:any):void {
    if (step !== this.step) {
      this.rewind();
      return;
    }
    this.step = step;
    this.values = this.values.set(step, value);
    this.next();
  }

  protected rewind() {
    this.gen.return();
    this.gen = this.fn();
    this.step = 0;
    const prevDeps = this.deps;
    asap(() => {
      prevDeps.forEach((dep:Emitter, index:number) => {
        dep.removeListener(this.stepListener(index))
      });
    });
    this.deps = noDeps;
    this.next();
  }

  protected next() {
    let prevVal:any = undefined;
    if (this.step) {
      prevVal = this.values.get(this.step);
    }
    this.step++;
    const res:IteratorResult<Emitter> = this.gen.next(prevVal);
    if (res.done) {
      this.emit(Immutable.fromJS(res.value));
    } else {
      const emitter = wrap(res.value);
      this.deps = this.deps.push(emitter);
      emitter.addListener(this.stepListener(this.step));
    }
  }

  protected open() {
    super.open();
    this.gen = this.fn();
    this.next();
  }

  protected close() {
    super.close();
    this.deps.forEach((emitter:Emitter, index:number) => {
      emitter.removeListener(this.stepListener(index));
    });
    this.deps = noDeps;
  }

}

export function proc(fn:Gen):Proc {
  return new Proc(fn);
}
