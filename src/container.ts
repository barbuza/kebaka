import * as Immutable from 'immutable';

import {Listener, Mapper, Bindable} from './types';
import {ImmutableEmitter} from './immutable-emitter';
import {makeJSMapper} from './make-js-mapper';
import {Ref} from './ref';
import {Chain} from './chain';

type Key = string | number;
type KeyPath = Immutable.List<Key>;
type RefMap = Immutable.Map<KeyPath, Ref>;

const emptyKeyPath = Immutable.List<Key>();
const emptyRefs = Immutable.Map<KeyPath, Ref>();
const emptyKeyPathListeners = Immutable.Map<KeyPath, Listener>();

function findRefs(value:any, prefix:KeyPath = emptyKeyPath):RefMap {
  if (value instanceof Ref) {
    return emptyRefs.set(prefix, value);
  }
  if (value instanceof Immutable.Iterable) {
    return value.reduce(
      (refs:RefMap, child:any, key:Key) => refs.mergeDeep(findRefs(child, prefix.push(key))),
      emptyRefs
    );
  }
  return emptyRefs;
}

function hasRefs(value:any):boolean {
  if (value instanceof Ref) {
    return true;
  }
  if (value instanceof Immutable.Iterable) {
    return value.some(hasRefs);
  }
  return false;
}

export class Container extends ImmutableEmitter implements Bindable {

  protected keyPathListeners = emptyKeyPathListeners;
  protected source:any;
  protected value:any;
  protected refs:RefMap;

  constructor(source:any) {
    super();
    this.value = this.source = Immutable.fromJS(source);
    this.refs = findRefs(this.value);
  }

  keyPathListener(keyPath:KeyPath):Listener {
    if (!this.keyPathListeners.has(keyPath)) {
      this.keyPathListeners = this.keyPathListeners.set(keyPath, this.updateValue.bind(this, keyPath));
    }
    return this.keyPathListeners.get(keyPath);
  }

  open() {
    super.open();

    this.refs.forEach((ref, keyPath) => ref.addListener(this.keyPathListener(keyPath)));

    if (this.refs.isEmpty()) {
      this.emit(this.value);
    }
  }

  close() {
    super.close();

    this.refs.forEach((ref, keyPath) => ref.removeListener(this.keyPathListener(keyPath)));
  }

  updateValue(keyPath:KeyPath, value:any) {
    if (keyPath.isEmpty()) {
      this.value = value;
    } else {
      this.value = this.value.setIn(keyPath, value);
    }
    if (!hasRefs(this.value)) {
      this.emit(this.value);
    }
  }

  bind(mapper:Mapper):Chain {
    return new Chain(this, Immutable.List.of(mapper));
  }

  bindJS(mapper:Mapper):Chain {
    return this.bind(makeJSMapper(mapper));
  }

  equals(other:Container):boolean {
    return (other instanceof Container) && Immutable.is(this.source, other.source);
  }

}
