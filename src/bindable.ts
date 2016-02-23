module Kebaka {

  export interface Bindable extends Emitter {
    bind(mapper:AnyMapper):Bindable;
    bindJS(mapper:AnyMapper):Bindable;
  }

}
