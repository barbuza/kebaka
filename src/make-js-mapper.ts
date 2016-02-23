import {Iterable, fromJS} from 'immutable';

import {AnyMapper} from './types';

export default function makeJSMapper(mapper:AnyMapper):AnyMapper {
  return (value:any):any => {
    const jsValue = value instanceof Iterable ? value.toJS() : value;
    return fromJS(mapper(jsValue));
  };
}
