import { AST } from '../../parser';
import O from '../object';

const bool: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Bool.parse(environment.getVariable('value'));
  },
};

const int: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Integer.parse(environment.getVariable('value'));
  },
};

const dec: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Decimal.parse(environment.getVariable('value'));
  },
};

const str: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Str.parse(environment.getVariable('value'));
  },
};

const split: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'delimiter',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').split(environment.getVariable('delimiter'));
  },
};

const lines: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').split(new O.Str('\n'));
  },
};

export default {
  bool,
  int,
  dec,
  str,
  split,
  lines,
};
