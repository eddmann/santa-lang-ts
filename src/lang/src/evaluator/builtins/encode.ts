import { AST } from '../../parser';
import O from '../object';

const encodeJson = value => {
  if (value instanceof O.List) {
    return '[' + value.items.map(encodeJson).join(', ') + ']';
  }

  if (value instanceof O.Hash) {
    return (
      '{' +
      [...value.items.entries()]
        .map(([key, value]) => `"${encodeJson(key)}": ${encodeJson(value)}`)
        .join(', ') +
      '}'
    );
  }

  if (value instanceof O.Set) {
    return '[' + value.items.map(encodeJson).join(', ') + ']';
  }

  if (value instanceof O.Range) {
    if (value.end === Infinity) {
      throw new Error();
    }

    return '[' + value.items.map(encodeJson).join(', ') + ']';
  }

  if (value instanceof O.Nil) {
    return 'null';
  }

  return value.inspect();
};

const decodeJson = value => {
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
      return new O.List(value.map(decodeJson));
    }

    return new O.Hash(
      Object.entries(value).map(([key, value]) => [decodeJson(key), decodeJson(value)])
    );
  }

  throw new Error();
};

const json_encode: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return new O.Str(encodeJson(environment.getVariable('value')));
  },
};

const json_decode: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return decodeJson(JSON.parse(environment.getVariable('value').value));
  },
};

export default {
  json_encode,
  json_decode,
};
