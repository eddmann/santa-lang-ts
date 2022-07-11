import { Lexer } from '../lexer';
import { Parser, printer } from '../parser';

test('formats source code', () => {
  const source = `
let x = 1
let y=2.0   let z   =   x+y;

[1,2,  3] |> reduce(+,   0) 
  |> |x| x * x;

let add = |a, b| a + b
let inc =  add(_, 1);

let z = 1 \`add\`    x;
`;
});

const format = (source: string): string => {
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);
  return printer(parser.parse());
};
