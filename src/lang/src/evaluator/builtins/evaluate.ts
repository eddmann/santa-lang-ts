import { Lexer } from '../../lexer';
import { AST, Parser } from '../../parser';
import { evaluate as doEvaluate, O } from '../../evaluator';
import { applyFunction } from '../evaluator';

const evaluate: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'source',
    },
  ],
  body: (environment: O.Environment) => {
    const lexer = new Lexer(environment.getVariable('source').value);

    let ast: AST.Program;
    try {
      ast = new Parser(lexer).parse();
    } catch (err) {
      throw {
        message: `Parser error: ${err.message}`,
        line: err.token.line,
        column: err.token.column,
      };
    }

    return doEvaluate(ast, new O.Environment());
  },
};

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
  evaluate,
  type,
  memoize,
};
