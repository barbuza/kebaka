export interface Listener {
  (value:any):void;
}

export interface Mapper {
  (value:any):any;
}

export interface Emitter {
  addListener(listener:Listener):this;
  removeListener(listener:Listener):this;
}

export interface Bindable extends Emitter {
  bind(mapper:Mapper):Bindable;
  bindJS(mapper:Mapper):Bindable;
}
