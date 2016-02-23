import {Container} from './container';
import {Ref} from './ref';

export function wrap(value:any):Ref|Container {
  if (value instanceof Ref) {
    return value;
  }
  return new Container(value);
}
