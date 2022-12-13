import { Lexer } from '../../lexer';
import { AST, Parser } from '../../parser';
import { evaluate as doEvaluate, O } from '../../evaluator';

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

export default {
  evaluate,
};
