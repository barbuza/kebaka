import * as Immutable from 'immutable';

import {Mapper} from './types';

export function makeJSMapper(mapper:Mapper):Mapper {
  return (value:any):any => {
    const jsValue = value instanceof Immutable.Iterable ? value.toJS() : value;
    return Immutable.fromJS(mapper(jsValue));
  };
}
