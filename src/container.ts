import * as Immutable from 'immutable';
import {AnyListener, AnyMapper, RefKey, Key, KeyPath} from './types';
import {Bindable} from './bindable';
import {ImmutableEmitter} from './immutable-emitter';
import {Ref, RefMap, ref} from './ref';
import makeJSMapper from './make-js-mapper';

const EMPTY_KEY_PATH:KeyPath = Immutable.List<Key>();
const EMPTY_KEY_PATH_MAP:RefMap = Immutable.Map<KeyPath, Ref>();

let open = 0;

function findRefs(value:any, prefix:KeyPath = EMPTY_KEY_PATH):RefMap {
  if (value instanceof Ref) {
    return EMPTY_KEY_PATH_MAP.set(prefix, value);
  }
  if (value instanceof Immutable.Iterable) {
    return value.reduce(
      (refs:RefMap, child:any, key:Key) => refs.mergeDeep(findRefs(child, prefix.push(key))),
      EMPTY_KEY_PATH_MAP
    );
  }
  return EMPTY_KEY_PATH_MAP;
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

const EMPTY_KEYPATH_LISTENERS = Immutable.Map<KeyPath, AnyListener>();

class Container extends ImmutableEmitter implements Bindable {

  protected keyPathListeners = EMPTY_KEYPATH_LISTENERS;
  protected source:Immutable.List<any>|Immutable.Map<any, any>;
  protected value:Immutable.List<any>|Immutable.Map<any, any>;
  protected refs:RefMap;

  constructor(source:any) {
    super();
    this.value = this.source = Immutable.fromJS(source);
    this.refs = findRefs(this.value);
  }

  keyPathListener(keyPath:KeyPath):AnyListener {
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

  bind(mapper:AnyMapper):Chain {
    return new Chain(this.source, Immutable.List.of(mapper));
  }

  bindJS(mapper:AnyMapper):Chain {
    return this.bind(makeJSMapper(mapper));
  }

  equals(other:Container):boolean {
    return other instanceof Container && Immutable.is(this.source, other.source);
  }

}

const NO_MAPPERS = Immutable.List<AnyMapper>();
const EMPTY_CONTAINERS = Immutable.List<Container>();
const EMPTY_INDEX_LISTENERS = Immutable.Map<number, AnyListener>();

class Chain extends ImmutableEmitter implements Bindable {

  protected source:Container;
  protected mappers:Immutable.List<AnyMapper>;

  protected containers:Immutable.List<Container> = EMPTY_CONTAINERS;
  protected indexListeners:Immutable.Map<number, AnyListener> = EMPTY_INDEX_LISTENERS;

  constructor(source:any, mappers:Immutable.List<AnyMapper> = NO_MAPPERS) {
    super();
    this.mappers = mappers;
    this.source = source instanceof Container ? source : new Container(source);
  }

  protected open() {
    super.open();

    this.setContainer(0, this.source);
  }

  protected close() {
    super.close();

    this.containers.forEach((container, containerIndex) =>
      container.removeListener(this.indexListener(containerIndex)));

    this.containers = EMPTY_CONTAINERS;
  }

  indexListener(index:number) {
    if (!this.indexListeners.has(index)) {
      this.indexListeners = this.indexListeners.set(index, this.updateItem.bind(this, index));
    }
    return this.indexListeners.get(index);
  }

  bind(mapper:AnyMapper):Chain {
    return new Chain(this.source, this.mappers.push(mapper));
  }

  bindJS(mapper:AnyMapper):Chain {
    return this.bind(makeJSMapper(mapper));
  }

  updateItem(index:number, value:Immutable.Iterable<Key, any>) {
    if (index === this.mappers.size) {
      this.emit(value);
      return;
    }

    const mapper = this.mappers.get(index);
    const nextValue = mapper(value);
    this.setContainer(index + 1, new Container(nextValue));
  }

  setContainer(index:number, container:Container) {
    const oldContainer = this.containers.get(index);

    if (Immutable.is(oldContainer, container)) {
      return;
    }

    this.containers.slice(index)
      .forEach((container, containerIndex) =>
        container.removeListener(this.indexListener(containerIndex)));

    this.containers = this.containers.slice(0, index).toList().set(index, container);

    container.addListener(this.indexListener(index));
  }

}

function onValue(value:any) {
  console.log('--->', value);
}

const c = new Chain({a: ref('/a'), b: ref('/b')})
  .bind((value:any) => value.merge({e: ref('/e')}))
  .bind((value:any) => value.merge({d: ref('/d')}))
  .addListener(onValue);

const c2 = c
  .bindJS((value:{b: string}) => ({a: value.b}))
  .addListener(onValue);

// ref('/a').map(x => ({x})).addListener(value => console.log('-->', value));

ref('/a').emit('ref a value');
ref('/b').emit('ref b value');
ref('/e').emit('ref e value');
ref('/d').emit('ref d value');
ref('/Y').emit('YYYY');

c.removeListener(onValue);
c2.removeListener(onValue);
