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
    console.log(...environment.getVariable('values').items.map(arg => arg.inspect()));
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
    try {
      return new O.Str(
        require('fs').readFileSync(environment.getVariable('path').value, { encoding: 'utf-8' })
      );
    } catch (err) {
      throw new Error(`Unable to read path: ${environment.getVariable('path').value}`);
    }
  },
};

export default {
  puts,
  read,
};
