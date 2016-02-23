import * as Immutable from 'immutable';

import {AnyMapper, AnyListener, Bindable} from './types';
import {Container} from './container';
import {ImmutableEmitter} from './immutable-emitter';
import {makeJSMapper} from './make-js-mapper';

const noMappers = Immutable.List<AnyMapper>();
const emptyItems = Immutable.List<Container>();
const emptyIndexListeners = Immutable.Map<number, AnyListener>();

export class Chain extends ImmutableEmitter implements Bindable {

  protected source:Container;
  protected mappers:Immutable.List<AnyMapper>;

  protected items:Immutable.List<Container> = emptyItems;
  protected indexListeners:Immutable.Map<number, AnyListener> = emptyIndexListeners;

  constructor(source:Container, mappers:Immutable.List<AnyMapper> = noMappers) {
    super();
    this.mappers = mappers;
    this.source = source;
  }

  protected open() {
    super.open();

    this.setItem(0, this.source);
  }

  protected close() {
    super.close();

    this.items.forEach((item, itemIndex) =>
      item.removeListener(this.indexListener(itemIndex)));

    this.items = emptyItems;
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

  updateItem(index:number, value:any) {
    if (index === this.mappers.size) {
      this.emit(value);
      return;
    }

    const mapper = this.mappers.get(index);
    const nextValue = mapper(value);
    this.setItem(index + 1, new Container(nextValue));
  }

  setItem(index:number, newItem:Container) {
    const oldItem = this.items.get(index);

    if (Immutable.is(oldItem, newItem)) {
      return;
    }

    this.items.slice(index + 1)
      .forEach((item, itemIndex) =>
        item.removeListener(this.indexListener(itemIndex)));

    this.items = this.items.slice(0, index).toList().set(index, newItem);

    newItem.addListener(this.indexListener(index));

    if (oldItem) {
      oldItem.removeListener(this.indexListener(index));
    }
  }

}
