'use strict';

module Kebaka {

  export type Listener<T> = (value:T) => void;
  export type AnyListener = Listener<any>;

  type Mapper<T, R> = (value:T) => R;
  export type AnyMapper = Mapper<any, any>;

  export type RefKey = string;

  export type Key = string | number;
  export type KeyPath = Immutable.List<Key>;

}
