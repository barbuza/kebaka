export interface AnyListener {
  (value:any):void;
}

export interface AnyMapper {
  (value:any):any;
}

export interface Emitter {
  addListener(listener:AnyListener):this;
  removeListener(listener:AnyListener):this;
  emit(value:any):void;
}

export interface Bindable extends Emitter {
  bind(mapper:AnyMapper):Bindable;
  bindJS(mapper:AnyMapper):Bindable;
}
