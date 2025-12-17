import { AST } from '../../parser';
import O from '../object';

const id: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('value');
  },
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

const lessThanEqual: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').lessThanEqual(environment.getVariable('b'));
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

const greaterThanEqual: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').greaterThanEqual(environment.getVariable('b'));
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
    return environment.getVariable('a').isTruthy() ? O.FALSE : O.TRUE;
  },
};

const assert: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'assertion',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('assertion').isTruthy()) {
      throw new Error('Assertion failed');
    }

    return O.NIL;
  },
};

export default {
  '<': lessThan,
  '>': greaterThan,
  '<=': lessThanEqual,
  '>=': greaterThanEqual,
  '==': equals,
  '!=': notEquals,
  'unary_!': not,
  assert,
  id: id,
};
