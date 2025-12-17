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

const regex_match: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'pattern',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').regExMatch(environment.getVariable('pattern'));
  },
};

const regex_match_all: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'pattern',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').regExMatchAll(environment.getVariable('pattern'));
  },
};

const ints: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').parseInts();
  },
};

const upper: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').toUpper();
  },
};

const lower: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('string').toLower();
  },
};

const replace: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'subject',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'replacement',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'string',
    },
  ],
  body: (environment: O.Environment) => {
    return environment
      .getVariable('string')
      .replace(environment.getVariable('subject'), environment.getVariable('replacement'));
  },
};

const join: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'separator',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const separator = environment.getVariable('separator');
    const collection = environment.getVariable('collection');

    if (!(separator instanceof O.Str)) {
      throw new Error(`join expects a string separator, got ${separator.getName()}`);
    }

    const items: string[] = [];
    collection.getInteralSeq().forEach((item: O.Obj) => {
      items.push(item.inspect().replace(/^"|"$/g, ''));
    });

    return new O.Str(items.join(separator.value));
  },
};

const bit_and: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').bitAnd(environment.getVariable('b'));
  },
};

const bit_or: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').bitOr(environment.getVariable('b'));
  },
};

const bit_xor: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').bitXor(environment.getVariable('b'));
  },
};

const bit_shift_left: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').bitShiftLeft(environment.getVariable('b'));
  },
};

const bit_shift_right: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('a').bitShiftRight(environment.getVariable('b'));
  },
};

const bit_not: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').bitNot();
  },
};

const md5: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('value').md5();
  },
};

export default {
  bool,
  int,
  dec,
  str,
  split,
  lines,
  regex_match,
  regex_match_all,
  ints,
  upper,
  lower,
  replace,
  join,
  bit_or,
  bit_and,
  bit_xor,
  bit_shift_left,
  bit_shift_right,
  bit_not,
  md5,
};
