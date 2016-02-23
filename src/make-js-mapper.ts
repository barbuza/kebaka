import * as Immutable from 'immutable';

import {AnyMapper} from './types';

export function makeJSMapper(mapper:AnyMapper):AnyMapper {
  return (value:any):any => {
    const jsValue = value instanceof Immutable.Iterable ? value.toJS() : value;
    return Immutable.fromJS(mapper(jsValue));
  };
}
