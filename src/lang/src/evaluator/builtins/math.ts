import { AST } from '../../parser';
import O from '../object';

const add: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').add(environment.getVariable('b'));
  },
};

const subtract: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').subtract(environment.getVariable('b'));
  },
};

const multiply: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').multiply(environment.getVariable('b'));
  },
};

const divide: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').divide(environment.getVariable('b'));
  },
};

// https://www.nickivance.com/writing/20181129_remainders/index.html
const modulo: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').modulo(environment.getVariable('b'));
  },
};

const negative: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').negative();
  },
};

const abs: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').abs();
  },
};

const signum: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').signum();
  },
};

export default {
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
  '%': modulo,
  'unary_-': negative,
  abs,
  signum,
};
