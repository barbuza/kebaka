module Kebaka {

  export interface Emitter {

    addListener(listener:AnyListener):this;

    removeListener(listener:AnyListener):this;

  }

}
