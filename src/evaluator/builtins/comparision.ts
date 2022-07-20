import { AST } from '../../parser';
import O from '../object';

const isTruthy = (object: O.Obj): boolean => {
  return object !== O.FALSE && object !== O.NIL;
};

const equals: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').equals(environment.getVariable('b')) ? O.TRUE : O.FALSE;
  },
};

const notEquals: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').equals(environment.getVariable('b')) ? O.FALSE : O.TRUE;
  },
};

const lessThan: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').lessThan(environment.getVariable('b'));
  },
};

const greaterThan: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').greaterThan(environment.getVariable('b'));
  },
};

const and: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return isTruthy(environment.getVariable('a')) && isTruthy(environment.getVariable('b'))
      ? O.TRUE
      : O.FALSE;
  },
};

const or: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return isTruthy(environment.getVariable('a')) || isTruthy(environment.getVariable('b'))
      ? O.TRUE
      : O.FALSE;
  },
};

const not: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').not();
  },
};

const assert: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'assertions',
      },
    },
  ],
  body: (environment: O.Environment) => {
    let assertions = environment.getVariable('assertions').items;

    let message = '';
    if (assertions.last() instanceof O.Str) {
      message = assertions.last().value;
      assertions = assertions.pop();
    }

    for (const predicate of assertions) {
      if (!isTruthy(predicate)) {
        return new Error('Assertion failed' + (message ? ': ' + message : ''));
      }
    }

    return O.NIL;
  },
};

export default {
  '<': lessThan,
  '>': greaterThan,
  '==': equals,
  '!=': notEquals,
  '&&': and,
  '||': or,
  'unary_!': not,
  assert,
};
