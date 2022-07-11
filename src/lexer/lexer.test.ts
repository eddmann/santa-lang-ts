import { Lexer, TokenKind, Token } from '../lexer';

test('integer', () => {
  const source = '1';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 1 },
    { kind: 'EOF', literal: '', line: 1, column: 2 },
  ]);
});

test('decimal', () => {
  const source = '1.5';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'DECIMAL', literal: '1.5', line: 1, column: 1 },
    { kind: 'EOF', literal: '', line: 1, column: 4 },
  ]);
});

test('string', () => {
  const source = '"Hello, world!"';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'STRING', literal: 'Hello, world!', line: 1, column: 3 },
    { kind: 'EOF', literal: '', line: 1, column: 16 },
  ]);
});

test('string with escape characters', () => {
  const source = '"\\b \\f \\r \\n \\t \\\\ \\""';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'STRING', literal: '\b \f \r \n \t \\ "', line: 1, column: 10 },
    { kind: 'EOF', literal: '', line: 1, column: 23 },
  ]);
});

test('boolean', () => {
  const source = 'true; false;';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'TRUE', literal: 'true', line: 1, column: 1 },
    { kind: ';', literal: ';', line: 1, column: 5 },
    { kind: 'FALSE', literal: 'false', line: 1, column: 7 },
    { kind: ';', literal: ';', line: 1, column: 12 },
    { kind: 'EOF', literal: '', line: 1, column: 13 },
  ]);
});

test('function literal with block statement', () => {
  const source = '|x, y| { x + y; }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 1, column: 1 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 2 },
    { kind: ',', literal: ',', line: 1, column: 3 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 5 },
    { kind: '|', literal: '|', line: 1, column: 6 },
    { kind: '{', literal: '{', line: 1, column: 8 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 10 },
    { kind: '+', literal: '+', line: 1, column: 12 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 14 },
    { kind: ';', literal: ';', line: 1, column: 15 },
    { kind: '}', literal: '}', line: 1, column: 17 },
    { kind: 'EOF', literal: '', line: 1, column: 18 },
  ]);
});

test('function literal with expression statement', () => {
  const source = '|x, y| x + y';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 1, column: 1 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 2 },
    { kind: ',', literal: ',', line: 1, column: 3 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 5 },
    { kind: '|', literal: '|', line: 1, column: 6 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 8 },
    { kind: '+', literal: '+', line: 1, column: 10 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 12 },
    { kind: 'EOF', literal: '', line: 1, column: 13 },
  ]);
});

test('match expression', () => {
  const source = 'match x { 1 { "one" } [e] if e == 2 { "two" } _ { "three" } }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'MATCH', literal: 'match', line: 1, column: 1 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 7 },
    { kind: '{', literal: '{', line: 1, column: 9 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 11 },
    { kind: '{', literal: '{', line: 1, column: 13 },
    { kind: 'STRING', literal: 'one', line: 1, column: 17 },
    { kind: '}', literal: '}', line: 1, column: 21 },
    { kind: '[', literal: '[', line: 1, column: 23 },
    { kind: 'IDENTIFIER', literal: 'e', line: 1, column: 24 },
    { kind: ']', literal: ']', line: 1, column: 25 },
    { kind: 'IF', literal: 'if', line: 1, column: 27 },
    { kind: 'IDENTIFIER', literal: 'e', line: 1, column: 30 },
    { kind: '==', literal: '==', line: 1, column: 32 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 35 },
    { kind: '{', literal: '{', line: 1, column: 37 },
    { kind: 'STRING', literal: 'two', line: 1, column: 41 },
    { kind: '}', literal: '}', line: 1, column: 45 },
    { kind: '_', literal: '_', line: 1, column: 47 },
    { kind: '{', literal: '{', line: 1, column: 49 },
    { kind: 'STRING', literal: 'three', line: 1, column: 53 },
    { kind: '}', literal: '}', line: 1, column: 59 },
    { kind: '}', literal: '}', line: 1, column: 61 },
    { kind: 'EOF', literal: '', line: 1, column: 62 },
  ]);
});

test('infix backtick call', () => {
  const source = 'one `add` two';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'one', line: 1, column: 1 },
    { kind: '`', literal: '`', line: 1, column: 5 },
    { kind: 'IDENTIFIER', literal: 'add', line: 1, column: 6 },
    { kind: '`', literal: '`', line: 1, column: 9 },
    { kind: 'IDENTIFIER', literal: 'two', line: 1, column: 11 },
    { kind: 'EOF', literal: '', line: 1, column: 14 },
  ]);
});

test('partial application placeholder', () => {
  const source = '_ + 2; +(_, 2)';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '_', literal: '_', line: 1, column: 1 },
    { kind: '+', literal: '+', line: 1, column: 3 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 5 },
    { kind: ';', literal: ';', line: 1, column: 6 },
    { kind: '+', literal: '+', line: 1, column: 8 },
    { kind: '(', literal: '(', line: 1, column: 9 },
    { kind: '_', literal: '_', line: 1, column: 10 },
    { kind: ',', literal: ',', line: 1, column: 11 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 13 },
    { kind: ')', literal: ')', line: 1, column: 14 },
    { kind: 'EOF', literal: '', line: 1, column: 15 },
  ]);
});

test('function literal with parameter destructuring', () => {
  const source = '|x, [y, ..z]| x + y';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 1, column: 1 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 2 },
    { kind: ',', literal: ',', line: 1, column: 3 },
    { kind: '[', literal: '[', line: 1, column: 5 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 6 },
    { kind: ',', literal: ',', line: 1, column: 7 },
    { kind: '..', literal: '..', line: 1, column: 9 },
    { kind: 'IDENTIFIER', literal: 'z', line: 1, column: 11 },
    { kind: ']', literal: ']', line: 1, column: 12 },
    { kind: '|', literal: '|', line: 1, column: 13 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 15 },
    { kind: '+', literal: '+', line: 1, column: 17 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 19 },
    { kind: 'EOF', literal: '', line: 1, column: 20 },
  ]);
});

test('list literal', () => {
  const source = '[1, 2.5, "hello"]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '[', literal: '[', line: 1, column: 1 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 2 },
    { kind: ',', literal: ',', line: 1, column: 3 },
    { kind: 'DECIMAL', literal: '2.5', line: 1, column: 5 },
    { kind: ',', literal: ',', line: 1, column: 8 },
    { kind: 'STRING', literal: 'hello', line: 1, column: 12 },
    { kind: ']', literal: ']', line: 1, column: 17 },
    { kind: 'EOF', literal: '', line: 1, column: 18 },
  ]);
});

test('hash literal', () => {
  const source = '#{"hello": {x}, 1: "2", [1, 2]: 1.4}';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '#{', literal: '#{', line: 1, column: 1 },
    { kind: 'STRING', literal: 'hello', line: 1, column: 5 },
    { kind: ':', literal: ':', line: 1, column: 10 },
    { kind: '{', literal: '{', line: 1, column: 12 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 13 },
    { kind: '}', literal: '}', line: 1, column: 14 },
    { kind: ',', literal: ',', line: 1, column: 15 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 17 },
    { kind: ':', literal: ':', line: 1, column: 18 },
    { kind: 'STRING', literal: '2', line: 1, column: 22 },
    { kind: ',', literal: ',', line: 1, column: 23 },
    { kind: '[', literal: '[', line: 1, column: 25 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 26 },
    { kind: ',', literal: ',', line: 1, column: 27 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 29 },
    { kind: ']', literal: ']', line: 1, column: 30 },
    { kind: ':', literal: ':', line: 1, column: 31 },
    { kind: 'DECIMAL', literal: '1.4', line: 1, column: 33 },
    { kind: '}', literal: '}', line: 1, column: 36 },
    { kind: 'EOF', literal: '', line: 1, column: 37 },
  ]);
});

test('set literal', () => {
  const source = '{1, 2, 3}';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '{', literal: '{', line: 1, column: 1 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 2 },
    { kind: ',', literal: ',', line: 1, column: 3 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 5 },
    { kind: ',', literal: ',', line: 1, column: 6 },
    { kind: 'INTEGER', literal: '3', line: 1, column: 8 },
    { kind: '}', literal: '}', line: 1, column: 9 },
    { kind: 'EOF', literal: '', line: 1, column: 10 },
  ]);
});

test('bounded range', () => {
  const source = '1..10';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 2 },
    { kind: '..', literal: '..', line: 1, column: 3 },
    { kind: 'INTEGER', literal: '10', line: 1, column: 5 },
    { kind: 'EOF', literal: '', line: 1, column: 7 },
  ]);
});

test('unbounded range', () => {
  const source = '1..';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 2 },
    { kind: '..', literal: '..', line: 1, column: 3 },
    { kind: 'EOF', literal: '', line: 1, column: 5 },
  ]);
});

test('section', () => {
  const source = 'section_one: {}; section_two: "sample"';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'section_one', line: 1, column: 1 },
    { kind: ':', literal: ':', line: 1, column: 12 },
    { kind: '{', literal: '{', line: 1, column: 14 },
    { kind: '}', literal: '}', line: 1, column: 15 },
    { kind: ';', literal: ';', line: 1, column: 16 },
    { kind: 'IDENTIFIER', literal: 'section_two', line: 1, column: 18 },
    { kind: ':', literal: ':', line: 1, column: 29 },
    { kind: 'STRING', literal: 'sample', line: 1, column: 33 },
    { kind: 'EOF', literal: '', line: 1, column: 39 },
  ]);
});

test('section with sub-section', () => {
  const source = 'section_one: { section_two: "sample" }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'section_one', line: 1, column: 1 },
    { kind: ':', literal: ':', line: 1, column: 12 },
    { kind: '{', literal: '{', line: 1, column: 14 },
    { kind: 'IDENTIFIER', literal: 'section_two', line: 1, column: 16 },
    { kind: ':', literal: ':', line: 1, column: 27 },
    { kind: 'STRING', literal: 'sample', line: 1, column: 31 },
    { kind: '}', literal: '}', line: 1, column: 38 },
    { kind: 'EOF', literal: '', line: 1, column: 39 },
  ]);
});

test('assignment', () => {
  const source = 'let x = 1; let mut y = 1; let [x, y, ..z] = [1, 2, 3, 4]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'LET', literal: 'let', line: 1, column: 1 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 5 },
    { kind: '=', literal: '=', line: 1, column: 7 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 9 },
    { kind: ';', literal: ';', line: 1, column: 10 },
    { kind: 'LET', literal: 'let', line: 1, column: 12 },
    { kind: 'MUTABLE', literal: 'mut', line: 1, column: 16 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 20 },
    { kind: '=', literal: '=', line: 1, column: 22 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 24 },
    { kind: ';', literal: ';', line: 1, column: 25 },
    { kind: 'LET', literal: 'let', line: 1, column: 27 },
    { kind: '[', literal: '[', line: 1, column: 31 },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 32 },
    { kind: ',', literal: ',', line: 1, column: 33 },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 35 },
    { kind: ',', literal: ',', line: 1, column: 36 },
    { kind: '..', literal: '..', line: 1, column: 38 },
    { kind: 'IDENTIFIER', literal: 'z', line: 1, column: 40 },
    { kind: ']', literal: ']', line: 1, column: 41 },
    { kind: '=', literal: '=', line: 1, column: 43 },
    { kind: '[', literal: '[', line: 1, column: 45 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 46 },
    { kind: ',', literal: ',', line: 1, column: 47 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 49 },
    { kind: ',', literal: ',', line: 1, column: 50 },
    { kind: 'INTEGER', literal: '3', line: 1, column: 52 },
    { kind: ',', literal: ',', line: 1, column: 53 },
    { kind: 'INTEGER', literal: '4', line: 1, column: 55 },
    { kind: ']', literal: ']', line: 1, column: 56 },
    { kind: 'EOF', literal: '', line: 1, column: 57 },
  ]);
});

test('if expression', () => {
  const source = 'if 0 < 5 { 1 } else { 2 }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IF', literal: 'if', line: 1, column: 1 },
    { kind: 'INTEGER', literal: '0', line: 1, column: 4 },
    { kind: '<', literal: '<', line: 1, column: 6 },
    { kind: 'INTEGER', literal: '5', line: 1, column: 8 },
    { kind: '{', literal: '{', line: 1, column: 10 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 12 },
    { kind: '}', literal: '}', line: 1, column: 14 },
    { kind: 'ELSE', literal: 'else', line: 1, column: 16 },
    { kind: '{', literal: '{', line: 1, column: 21 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 23 },
    { kind: '}', literal: '}', line: 1, column: 25 },
    { kind: 'EOF', literal: '', line: 1, column: 26 },
  ]);
});

test('call expression', () => {
  const source = 'add(1, 2)';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'add', line: 1, column: 1 },
    { kind: '(', literal: '(', line: 1, column: 4 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 5 },
    { kind: ',', literal: ',', line: 1, column: 6 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 8 },
    { kind: ')', literal: ')', line: 1, column: 9 },
    { kind: 'EOF', literal: '', line: 1, column: 10 },
  ]);
});

test('multiline source', () => {
  const source = `
let a = 1;
let b = 1.5;
`.trim();

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'LET', literal: 'let', line: 1, column: 1 },
    { kind: 'IDENTIFIER', literal: 'a', line: 1, column: 5 },
    { kind: '=', literal: '=', line: 1, column: 7 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 9 },
    { kind: ';', literal: ';', line: 1, column: 10 },
    { kind: 'LET', literal: 'let', line: 2, column: 0 },
    { kind: 'IDENTIFIER', literal: 'b', line: 2, column: 4 },
    { kind: '=', literal: '=', line: 2, column: 6 },
    { kind: 'DECIMAL', literal: '1.5', line: 2, column: 8 },
    { kind: ';', literal: ';', line: 2, column: 11 },
    { kind: 'EOF', literal: '', line: 2, column: 12 },
  ]);
});

test('minus with negative value', () => {
  const source = '1 - -2';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 1 },
    { kind: '-', literal: '-', line: 1, column: 3 },
    { kind: '-', literal: '-', line: 1, column: 5 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 6 },
    { kind: 'EOF', literal: '', line: 1, column: 7 },
  ]);
});

test('function composition', () => {
  const source = 'inc >> dec';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'inc', line: 1, column: 1 },
    { kind: '>>', literal: '>>', line: 1, column: 5 },
    { kind: 'IDENTIFIER', literal: 'dec', line: 1, column: 8 },
    { kind: 'EOF', literal: '', line: 1, column: 11 },
  ]);
});

test('function threading', () => {
  const source = '1 |> inc |> dec';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 1 },
    { kind: '|>', literal: '|>', line: 1, column: 3 },
    { kind: 'IDENTIFIER', literal: 'inc', line: 1, column: 6 },
    { kind: '|>', literal: '|>', line: 1, column: 10 },
    { kind: 'IDENTIFIER', literal: 'dec', line: 1, column: 13 },
    { kind: 'EOF', literal: '', line: 1, column: 16 },
  ]);
});

test('indexing', () => {
  const source = 'list[1]; list[-1]; list[2..5]; list[-2..]; list[0..-2]; list["key"]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 1 },
    { kind: '[', literal: '[', line: 1, column: 5 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 6 },
    { kind: ']', literal: ']', line: 1, column: 7 },
    { kind: ';', literal: ';', line: 1, column: 8 },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 10 },
    { kind: '[', literal: '[', line: 1, column: 14 },
    { kind: '-', literal: '-', line: 1, column: 15 },
    { kind: 'INTEGER', literal: '1', line: 1, column: 16 },
    { kind: ']', literal: ']', line: 1, column: 17 },
    { kind: ';', literal: ';', line: 1, column: 18 },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 20 },
    { kind: '[', literal: '[', line: 1, column: 24 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 26 },
    { kind: '..', literal: '..', line: 1, column: 27 },
    { kind: 'INTEGER', literal: '5', line: 1, column: 29 },
    { kind: ']', literal: ']', line: 1, column: 30 },
    { kind: ';', literal: ';', line: 1, column: 31 },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 33 },
    { kind: '[', literal: '[', line: 1, column: 37 },
    { kind: '-', literal: '-', line: 1, column: 38 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 40 },
    { kind: '..', literal: '..', line: 1, column: 41 },
    { kind: ']', literal: ']', line: 1, column: 43 },
    { kind: ';', literal: ';', line: 1, column: 44 },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 46 },
    { kind: '[', literal: '[', line: 1, column: 50 },
    { kind: 'INTEGER', literal: '0', line: 1, column: 52 },
    { kind: '..', literal: '..', line: 1, column: 53 },
    { kind: '-', literal: '-', line: 1, column: 55 },
    { kind: 'INTEGER', literal: '2', line: 1, column: 56 },
    { kind: ']', literal: ']', line: 1, column: 57 },
    { kind: ';', literal: ';', line: 1, column: 58 },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 60 },
    { kind: '[', literal: '[', line: 1, column: 64 },
    { kind: 'STRING', literal: 'key', line: 1, column: 67 },
    { kind: ']', literal: ']', line: 1, column: 70 },
    { kind: 'EOF', literal: '', line: 1, column: 71 },
  ]);
});

const tokenize = (source: string): Token[] => {
  const lexer = new Lexer(source);

  let token: Token;
  const tokens = [];

  while (true) {
    token = lexer.nextToken();
    tokens.push(token);
    if (token.kind === TokenKind.EOF) break;
  }

  return tokens;
};
