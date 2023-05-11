import { Lexer, TokenKind, Token } from '../lexer';

test('integer', () => {
  const source = '1';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 0, column: 0 },
    { kind: 'EOF', literal: '', line: 0, column: 1 },
  ]);
});

test('integer with seperators', () => {
  const source = '1_000_000';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1_000_000', line: 0, column: 0 },
    { kind: 'EOF', literal: '', line: 0, column: 9 },
  ]);
});

test('decimal', () => {
  const source = '1.5';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'DECIMAL', literal: '1.5', line: 0, column: 0 },
    { kind: 'EOF', literal: '', line: 0, column: 3 },
  ]);
});

test('decimal with seperators', () => {
  const source = '1_000_000.50';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'DECIMAL', literal: '1_000_000.50', line: 0, column: 0 },
    { kind: 'EOF', literal: '', line: 0, column: 12 },
  ]);
});

test('string', () => {
  const source = '"Hello, world!"';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'STRING', literal: 'Hello, world!', line: 0, column: 2 },
    { kind: 'EOF', literal: '', line: 0, column: 15 },
  ]);
});

test('string with escape characters', () => {
  const source = '"\\b \\f \\r \\n \\t \\\\ \\""';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'STRING', literal: '\b \f \r \n \t \\ "', line: 0, column: 9 },
    { kind: 'EOF', literal: '', line: 0, column: 22 },
  ]);
});

test('boolean', () => {
  const source = 'true; false;';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'TRUE', literal: 'true', line: 0, column: 0 },
    { kind: ';', literal: ';', line: 0, column: 4 },
    { kind: 'FALSE', literal: 'false', line: 0, column: 6 },
    { kind: ';', literal: ';', line: 0, column: 11 },
    { kind: 'EOF', literal: '', line: 0, column: 12 },
  ]);
});

test('nil', () => {
  const source = 'nil';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'NIL', literal: 'nil', line: 0, column: 0 },
    { kind: 'EOF', literal: '', line: 0, column: 3 },
  ]);
});

test('comments', () => {
  const source = `
    1 // sample comment one
    // sample comment two
  `;

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 4 },
    { kind: 'COMMENT', literal: ' sample comment one', line: 1, column: 8 },
    { kind: 'COMMENT', literal: ' sample comment two', line: 2, column: 6 },
    { kind: 'EOF', literal: '', line: 3, column: 2 },
  ]);
});

test('function literal with block statement', () => {
  const source = '|x, y| { x + y; }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 0, column: 0 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 1 },
    { kind: ',', literal: ',', line: 0, column: 2 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 4 },
    { kind: '|', literal: '|', line: 0, column: 5 },
    { kind: '{', literal: '{', line: 0, column: 7 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 9 },
    { kind: '+', literal: '+', line: 0, column: 11 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 13 },
    { kind: ';', literal: ';', line: 0, column: 14 },
    { kind: '}', literal: '}', line: 0, column: 16 },
    { kind: 'EOF', literal: '', line: 0, column: 17 },
  ]);
});

test('function literal with expression statement', () => {
  const source = '|x, y| x + y';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 0, column: 0 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 1 },
    { kind: ',', literal: ',', line: 0, column: 2 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 4 },
    { kind: '|', literal: '|', line: 0, column: 5 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 7 },
    { kind: '+', literal: '+', line: 0, column: 9 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 11 },
    { kind: 'EOF', literal: '', line: 0, column: 12 },
  ]);
});

test('match expression', () => {
  const source = 'match x { 1 { "one" } [e] if e == 2 { "two" } _ { "three" } }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'MATCH', literal: 'match', line: 0, column: 0 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 6 },
    { kind: '{', literal: '{', line: 0, column: 8 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 10 },
    { kind: '{', literal: '{', line: 0, column: 12 },
    { kind: 'STRING', literal: 'one', line: 0, column: 16 },
    { kind: '}', literal: '}', line: 0, column: 20 },
    { kind: '[', literal: '[', line: 0, column: 22 },
    { kind: 'IDENTIFIER', literal: 'e', line: 0, column: 23 },
    { kind: ']', literal: ']', line: 0, column: 24 },
    { kind: 'IF', literal: 'if', line: 0, column: 26 },
    { kind: 'IDENTIFIER', literal: 'e', line: 0, column: 29 },
    { kind: '==', literal: '==', line: 0, column: 31 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 34 },
    { kind: '{', literal: '{', line: 0, column: 36 },
    { kind: 'STRING', literal: 'two', line: 0, column: 40 },
    { kind: '}', literal: '}', line: 0, column: 44 },
    { kind: '_', literal: '_', line: 0, column: 46 },
    { kind: '{', literal: '{', line: 0, column: 48 },
    { kind: 'STRING', literal: 'three', line: 0, column: 52 },
    { kind: '}', literal: '}', line: 0, column: 58 },
    { kind: '}', literal: '}', line: 0, column: 60 },
    { kind: 'EOF', literal: '', line: 0, column: 61 },
  ]);
});

test('infix backtick call', () => {
  const source = 'one `add` two';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'one', line: 0, column: 0 },
    { kind: '`', literal: '`', line: 0, column: 4 },
    { kind: 'IDENTIFIER', literal: 'add', line: 0, column: 5 },
    { kind: '`', literal: '`', line: 0, column: 8 },
    { kind: 'IDENTIFIER', literal: 'two', line: 0, column: 10 },
    { kind: 'EOF', literal: '', line: 0, column: 13 },
  ]);
});

test('partial application placeholder', () => {
  const source = '_ + 2; +(_, 2)';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '_', literal: '_', line: 0, column: 0 },
    { kind: '+', literal: '+', line: 0, column: 2 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 4 },
    { kind: ';', literal: ';', line: 0, column: 5 },
    { kind: '+', literal: '+', line: 0, column: 7 },
    { kind: '(', literal: '(', line: 0, column: 8 },
    { kind: '_', literal: '_', line: 0, column: 9 },
    { kind: ',', literal: ',', line: 0, column: 10 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 12 },
    { kind: ')', literal: ')', line: 0, column: 13 },
    { kind: 'EOF', literal: '', line: 0, column: 14 },
  ]);
});

test('function literal with parameter destructuring', () => {
  const source = '|x, [y, ..z]| x + y';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 0, column: 0 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 1 },
    { kind: ',', literal: ',', line: 0, column: 2 },
    { kind: '[', literal: '[', line: 0, column: 4 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 5 },
    { kind: ',', literal: ',', line: 0, column: 6 },
    { kind: '..', literal: '..', line: 0, column: 8 },
    { kind: 'IDENTIFIER', literal: 'z', line: 0, column: 10 },
    { kind: ']', literal: ']', line: 0, column: 11 },
    { kind: '|', literal: '|', line: 0, column: 12 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 14 },
    { kind: '+', literal: '+', line: 0, column: 16 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 18 },
    { kind: 'EOF', literal: '', line: 0, column: 19 },
  ]);
});

test('list literal', () => {
  const source = '[1, 2.5, "hello"]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '[', literal: '[', line: 0, column: 0 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 1 },
    { kind: ',', literal: ',', line: 0, column: 2 },
    { kind: 'DECIMAL', literal: '2.5', line: 0, column: 4 },
    { kind: ',', literal: ',', line: 0, column: 7 },
    { kind: 'STRING', literal: 'hello', line: 0, column: 11 },
    { kind: ']', literal: ']', line: 0, column: 16 },
    { kind: 'EOF', literal: '', line: 0, column: 17 },
  ]);
});

test('dictionary literal', () => {
  const source = '#{"hello": {x}, 1: "2", [1, 2]: 1.4}';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '#{', literal: '#{', line: 0, column: 0 },
    { kind: 'STRING', literal: 'hello', line: 0, column: 4 },
    { kind: ':', literal: ':', line: 0, column: 9 },
    { kind: '{', literal: '{', line: 0, column: 11 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 12 },
    { kind: '}', literal: '}', line: 0, column: 13 },
    { kind: ',', literal: ',', line: 0, column: 14 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 16 },
    { kind: ':', literal: ':', line: 0, column: 17 },
    { kind: 'STRING', literal: '2', line: 0, column: 21 },
    { kind: ',', literal: ',', line: 0, column: 22 },
    { kind: '[', literal: '[', line: 0, column: 24 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 25 },
    { kind: ',', literal: ',', line: 0, column: 26 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 28 },
    { kind: ']', literal: ']', line: 0, column: 29 },
    { kind: ':', literal: ':', line: 0, column: 30 },
    { kind: 'DECIMAL', literal: '1.4', line: 0, column: 32 },
    { kind: '}', literal: '}', line: 0, column: 35 },
    { kind: 'EOF', literal: '', line: 0, column: 36 },
  ]);
});

test('set literal', () => {
  const source = '{1, 2, 3}';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '{', literal: '{', line: 0, column: 0 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 1 },
    { kind: ',', literal: ',', line: 0, column: 2 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 4 },
    { kind: ',', literal: ',', line: 0, column: 5 },
    { kind: 'INTEGER', literal: '3', line: 0, column: 7 },
    { kind: '}', literal: '}', line: 0, column: 8 },
    { kind: 'EOF', literal: '', line: 0, column: 9 },
  ]);
});

test('bounded range', () => {
  const source = '1..10';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 0, column: 1 },
    { kind: '..', literal: '..', line: 0, column: 2 },
    { kind: 'INTEGER', literal: '10', line: 0, column: 4 },
    { kind: 'EOF', literal: '', line: 0, column: 6 },
  ]);
});

test('unbounded range', () => {
  const source = '1..';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 0, column: 1 },
    { kind: '..', literal: '..', line: 0, column: 2 },
    { kind: 'EOF', literal: '', line: 0, column: 4 },
  ]);
});

test('section', () => {
  const source = 'section_one: {}; section_two: "sample"';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'section_one', line: 0, column: 0 },
    { kind: ':', literal: ':', line: 0, column: 11 },
    { kind: '{', literal: '{', line: 0, column: 13 },
    { kind: '}', literal: '}', line: 0, column: 14 },
    { kind: ';', literal: ';', line: 0, column: 15 },
    { kind: 'IDENTIFIER', literal: 'section_two', line: 0, column: 17 },
    { kind: ':', literal: ':', line: 0, column: 28 },
    { kind: 'STRING', literal: 'sample', line: 0, column: 32 },
    { kind: 'EOF', literal: '', line: 0, column: 38 },
  ]);
});

test('section with sub-section', () => {
  const source = 'section_one: { section_two: "sample" }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'section_one', line: 0, column: 0 },
    { kind: ':', literal: ':', line: 0, column: 11 },
    { kind: '{', literal: '{', line: 0, column: 13 },
    { kind: 'IDENTIFIER', literal: 'section_two', line: 0, column: 15 },
    { kind: ':', literal: ':', line: 0, column: 26 },
    { kind: 'STRING', literal: 'sample', line: 0, column: 30 },
    { kind: '}', literal: '}', line: 0, column: 37 },
    { kind: 'EOF', literal: '', line: 0, column: 38 },
  ]);
});

test('assignment', () => {
  const source = 'let x = 1; let mut y = 1; let [x, y, ..z] = [1, 2, 3, 4]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'LET', literal: 'let', line: 0, column: 0 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 4 },
    { kind: '=', literal: '=', line: 0, column: 6 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 8 },
    { kind: ';', literal: ';', line: 0, column: 9 },
    { kind: 'LET', literal: 'let', line: 0, column: 11 },
    { kind: 'MUTABLE', literal: 'mut', line: 0, column: 15 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 19 },
    { kind: '=', literal: '=', line: 0, column: 21 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 23 },
    { kind: ';', literal: ';', line: 0, column: 24 },
    { kind: 'LET', literal: 'let', line: 0, column: 26 },
    { kind: '[', literal: '[', line: 0, column: 30 },
    { kind: 'IDENTIFIER', literal: 'x', line: 0, column: 31 },
    { kind: ',', literal: ',', line: 0, column: 32 },
    { kind: 'IDENTIFIER', literal: 'y', line: 0, column: 34 },
    { kind: ',', literal: ',', line: 0, column: 35 },
    { kind: '..', literal: '..', line: 0, column: 37 },
    { kind: 'IDENTIFIER', literal: 'z', line: 0, column: 39 },
    { kind: ']', literal: ']', line: 0, column: 40 },
    { kind: '=', literal: '=', line: 0, column: 42 },
    { kind: '[', literal: '[', line: 0, column: 44 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 45 },
    { kind: ',', literal: ',', line: 0, column: 46 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 48 },
    { kind: ',', literal: ',', line: 0, column: 49 },
    { kind: 'INTEGER', literal: '3', line: 0, column: 51 },
    { kind: ',', literal: ',', line: 0, column: 52 },
    { kind: 'INTEGER', literal: '4', line: 0, column: 54 },
    { kind: ']', literal: ']', line: 0, column: 55 },
    { kind: 'EOF', literal: '', line: 0, column: 56 },
  ]);
});

test('if expression', () => {
  const source = 'if 0 < 5 { 1 } else { 2 }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IF', literal: 'if', line: 0, column: 0 },
    { kind: 'INTEGER', literal: '0', line: 0, column: 3 },
    { kind: '<', literal: '<', line: 0, column: 5 },
    { kind: 'INTEGER', literal: '5', line: 0, column: 7 },
    { kind: '{', literal: '{', line: 0, column: 9 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 11 },
    { kind: '}', literal: '}', line: 0, column: 13 },
    { kind: 'ELSE', literal: 'else', line: 0, column: 15 },
    { kind: '{', literal: '{', line: 0, column: 20 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 22 },
    { kind: '}', literal: '}', line: 0, column: 24 },
    { kind: 'EOF', literal: '', line: 0, column: 25 },
  ]);
});

test('call expression', () => {
  const source = 'add(1, 2)';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'add', line: 0, column: 0 },
    { kind: '(', literal: '(', line: 0, column: 3 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 4 },
    { kind: ',', literal: ',', line: 0, column: 5 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 7 },
    { kind: ')', literal: ')', line: 0, column: 8 },
    { kind: 'EOF', literal: '', line: 0, column: 9 },
  ]);
});

test('multiline source', () => {
  const source = `
let a = 1;
let b = 1.5;
`.trim();

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'LET', literal: 'let', line: 0, column: 0 },
    { kind: 'IDENTIFIER', literal: 'a', line: 0, column: 4 },
    { kind: '=', literal: '=', line: 0, column: 6 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 8 },
    { kind: ';', literal: ';', line: 0, column: 9 },
    { kind: 'LET', literal: 'let', line: 1, column: 0 },
    { kind: 'IDENTIFIER', literal: 'b', line: 1, column: 4 },
    { kind: '=', literal: '=', line: 1, column: 6 },
    { kind: 'DECIMAL', literal: '1.5', line: 1, column: 8 },
    { kind: ';', literal: ';', line: 1, column: 11 },
    { kind: 'EOF', literal: '', line: 1, column: 12 },
  ]);
});

test('minus with negative value', () => {
  const source = '1 - -2';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 0, column: 0 },
    { kind: '-', literal: '-', line: 0, column: 2 },
    { kind: '-', literal: '-', line: 0, column: 4 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 5 },
    { kind: 'EOF', literal: '', line: 0, column: 6 },
  ]);
});

test('function composition', () => {
  const source = 'inc >> dec';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'inc', line: 0, column: 0 },
    { kind: '>>', literal: '>>', line: 0, column: 4 },
    { kind: 'IDENTIFIER', literal: 'dec', line: 0, column: 7 },
    { kind: 'EOF', literal: '', line: 0, column: 10 },
  ]);
});

test('function threading', () => {
  const source = '1 |> inc |> dec';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 0, column: 0 },
    { kind: '|>', literal: '|>', line: 0, column: 2 },
    { kind: 'IDENTIFIER', literal: 'inc', line: 0, column: 5 },
    { kind: '|>', literal: '|>', line: 0, column: 9 },
    { kind: 'IDENTIFIER', literal: 'dec', line: 0, column: 12 },
    { kind: 'EOF', literal: '', line: 0, column: 15 },
  ]);
});

test('indexing', () => {
  const source = 'list[1]; list[-1]; list[2..5]; list[-2..]; list[0..-2]; list["key"]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'list', line: 0, column: 0 },
    { kind: '[', literal: '[', line: 0, column: 4 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 5 },
    { kind: ']', literal: ']', line: 0, column: 6 },
    { kind: ';', literal: ';', line: 0, column: 7 },
    { kind: 'IDENTIFIER', literal: 'list', line: 0, column: 9 },
    { kind: '[', literal: '[', line: 0, column: 13 },
    { kind: '-', literal: '-', line: 0, column: 14 },
    { kind: 'INTEGER', literal: '1', line: 0, column: 15 },
    { kind: ']', literal: ']', line: 0, column: 16 },
    { kind: ';', literal: ';', line: 0, column: 17 },
    { kind: 'IDENTIFIER', literal: 'list', line: 0, column: 19 },
    { kind: '[', literal: '[', line: 0, column: 23 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 25 },
    { kind: '..', literal: '..', line: 0, column: 26 },
    { kind: 'INTEGER', literal: '5', line: 0, column: 28 },
    { kind: ']', literal: ']', line: 0, column: 29 },
    { kind: ';', literal: ';', line: 0, column: 30 },
    { kind: 'IDENTIFIER', literal: 'list', line: 0, column: 32 },
    { kind: '[', literal: '[', line: 0, column: 36 },
    { kind: '-', literal: '-', line: 0, column: 37 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 39 },
    { kind: '..', literal: '..', line: 0, column: 40 },
    { kind: ']', literal: ']', line: 0, column: 42 },
    { kind: ';', literal: ';', line: 0, column: 43 },
    { kind: 'IDENTIFIER', literal: 'list', line: 0, column: 45 },
    { kind: '[', literal: '[', line: 0, column: 49 },
    { kind: 'INTEGER', literal: '0', line: 0, column: 51 },
    { kind: '..', literal: '..', line: 0, column: 52 },
    { kind: '-', literal: '-', line: 0, column: 54 },
    { kind: 'INTEGER', literal: '2', line: 0, column: 55 },
    { kind: ']', literal: ']', line: 0, column: 56 },
    { kind: ';', literal: ';', line: 0, column: 57 },
    { kind: 'IDENTIFIER', literal: 'list', line: 0, column: 59 },
    { kind: '[', literal: '[', line: 0, column: 63 },
    { kind: 'STRING', literal: 'key', line: 0, column: 66 },
    { kind: ']', literal: ']', line: 0, column: 69 },
    { kind: 'EOF', literal: '', line: 0, column: 70 },
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
