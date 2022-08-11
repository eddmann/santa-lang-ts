import { AST } from '../../parser';
import O from '../object';

const puts: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'values',
      },
    },
  ],
  body: (environment: O.Environment) => {
    environment
      .getIO()
      .output([...environment.getVariable('values').items.map(arg => arg.inspect())]);
    return O.NIL;
  },
};

const read: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'path',
    },
  ],
  body: (environment: O.Environment) => {
    return new O.Str(environment.getIO().input(environment.getVariable('path').value));
  },
};

export default {
  puts,
  read,
};
