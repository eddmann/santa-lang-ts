import { ASTKind, DictionaryExpression, IfExpression, Node } from './ast';

function print(node: Node): string {
  switch (node.kind) {
    case ASTKind.ListExpression:
      return `[${node.elements.map(print).join(', ')}]`;
    case ASTKind.SetExpression:
      return `{${node.elements.map(print).join(', ')}}`;
    case ASTKind.BlockStatement:
      return node.statements.map(print).join('\n');
    case ASTKind.Bool:
      return String(node.value);
    case ASTKind.CallExpression: {
      const args = node.arguments.map(print).join(', ');
      return `${print(node.function)}(${args})`;
    }
    case ASTKind.InfixExpression:
      if ('abcdefghijklmnopqrstuvwxyz'.includes(node.function.value[0])) {
        return `(${print(node.arguments[0])} \`${print(node.function)}\` ${print(
          node.arguments[1]
        )})`;
      }

      return `(${print(node.arguments[0])} ${print(node.function)} ${print(node.arguments[1])})`;
    case ASTKind.PrefixExpression:
      return `${node.function.value.replace('unary_', '')}${print(node.argument)}`;
    case ASTKind.ExpressionStatement:
      return print(node.expression) + ';';
    case ASTKind.FunctionLiteral: {
      const params = node.parameters.map(print).join(', ');
      return `|${params}| {\n  ${print(node.body)}\n}`;
    }
    case ASTKind.DictionaryExpression:
      return printDictionary(node);
    case ASTKind.Identifier:
      return node.value;
    case ASTKind.IfExpression:
      return printIfExpression(node);
    case ASTKind.Integer:
      return String(node.value);
    case ASTKind.Decimal:
      return String(node.value);
    case ASTKind.IndexExpression:
      return `(${print(node.item)}[${print(node.index)}])`;
    case ASTKind.Let:
      return `let ${node.isMutable ? 'mut ' : ''}${print(node.name)} = ${print(node.value)};`;
    case ASTKind.Program:
      return node.statements.map(print).join('\n');
    case ASTKind.Return:
      return `return ${print(node.returnValue)};`;
    case ASTKind.Str:
      return `"${node.value}"`;
    case ASTKind.FunctionThread:
      const initial = print(node.initial);
      const others = node.functions.map(print).join(' |> ');
      return `${initial} |> ${others}`;
    case ASTKind.IndexExpression:
      return '';
    case ASTKind.Placeholder:
      return '_';
    default:
      throw new Error(`Unknown AST node type ${node.kind}`);
  }
}

function printIfExpression({ condition, consequence, alternative }: IfExpression): string {
  const alternativeString = alternative ? ` else {\n  ${print(alternative)}\n}` : '';

  return `if ${print(condition)} {\n  ${print(consequence)}\n}` + alternativeString;
}

function printDictionary(node: DictionaryExpression): string {
  const pairs = [];

  for (let i = 0; i < node.pairs.length; i += 2) {
    pairs.push(`${print(node.pairs[i])}: ${print(node.pairs[i + 1])}`);
  }

  return `#{${pairs.join(', ')}}`;
}

export default print;
