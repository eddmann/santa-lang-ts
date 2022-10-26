import { O } from 'santa-lang/evaluator';

export const encode = value => {
  if (typeof value === 'boolean') {
    return new O.Bool(value);
  }

  if (typeof value === 'number') {
    return value % 1 === 0 ? new O.Integer(value) : new O.Decimal(value);
  }

  if (typeof value === 'string') {
    return new O.Str(value);
  }

  if (typeof value === 'object') {
    if (value instanceof Array) {
      return new O.List(value.map(encode));
    }

    return new O.Hash(Object.entries(value).map(([key, value]) => [encode(key), encode(value)]));
  }

  throw new Error(`Unable to encode ${typeof value}`);
};

export const decode = value => {
  if (value instanceof O.List) {
    return [...value.items.map(decode)];
  }

  if (value instanceof O.Hash) {
    return [...value.items.entries()].reduce(
      (acc, [key, value]) => ({ ...acc, [decode(key)]: decode(value) }),
      {}
    );
  }

  if (value instanceof O.Set) {
    return [...value.items.map(decode)];
  }

  if (value instanceof O.Range) {
    if (value.end === Infinity) {
      throw new Error('Unable to decode an infinite range');
    }

    return [...value.items.map(decode)];
  }

  if (value instanceof O.Nil) {
    return null;
  }

  return value.value;
};
