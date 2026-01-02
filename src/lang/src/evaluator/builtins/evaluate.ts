import { AST } from '../../parser';
import { O } from '../../evaluator';
import { applyFunction } from '../evaluator';

const type: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return new O.Str(environment.getVariable('value').getName());
  },
};

const memoize: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'fn',
    },
  ],
  body: (environment: O.Environment) => {
    const fn = environment.getVariable('fn');
    const cache = new Map();

    return new O.BuiltinFunc(
      [
        {
          kind: AST.ASTKind.RestElement,
          argument: {
            kind: AST.ASTKind.Identifier,
            value: 'args',
          },
        },
      ],
      (environment: O.Environment) => {
        const key = JSON.stringify([...environment.getVariable('args').items]);

        if (cache.has(key)) {
          return cache.get(key);
        }

        const value = applyFunction(fn, [...environment.getVariable('args').items]);
        cache.set(key, value);

        return value;
      },
      environment
    );
  },
};

export default {
  type,
  memoize,
};
