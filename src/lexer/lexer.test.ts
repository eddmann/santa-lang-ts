import { Lexer, TokenKind, Token } from '../lexer';

test('integer', () => {
  const source = '1';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 1, position: [0, 0] },
    { kind: 'EOF', literal: '', line: 1, column: 2, position: [0, 0] },
  ]);
});

test('decimal', () => {
  const source = '1.5';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'DECIMAL', literal: '1.5', line: 1, column: 1, position: [0, 2] },
    { kind: 'EOF', literal: '', line: 1, column: 4, position: [2, 2] },
  ]);
});

test('string', () => {
  const source = '"Hello, world!"';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'STRING', literal: 'Hello, world!', line: 1, column: 3, position: [0, 14] },
    { kind: 'EOF', literal: '', line: 1, column: 16, position: [14, 14] },
  ]);
});

test('string with escape characters', () => {
  const source = '"\\b \\f \\r \\n \\t \\\\ \\""';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'STRING', literal: '\b \f \r \n \t \\ "', line: 1, column: 10, position: [0, 21] },
    { kind: 'EOF', literal: '', line: 1, column: 23, position: [21, 21] },
  ]);
});

test('boolean', () => {
  const source = 'true; false;';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'TRUE', literal: 'true', line: 1, column: 1, position: [0, 3] },
    { kind: ';', literal: ';', line: 1, column: 5, position: [4, 4] },
    { kind: 'FALSE', literal: 'false', line: 1, column: 7, position: [6, 10] },
    { kind: ';', literal: ';', line: 1, column: 12, position: [11, 11] },
    { kind: 'EOF', literal: '', line: 1, column: 13, position: [11, 11] },
  ]);
});

test('nil', () => {
  const source = 'nil';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'NIL', literal: 'nil', line: 1, column: 1, position: [0, 2] },
    { kind: 'EOF', literal: '', line: 1, column: 4, position: [2, 2] },
  ]);
});

test('comments', () => {
  const source = `
    1 // sample comment one
    // sample comment two
  `;

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 2, column: 4, position: [5, 5] },
    { kind: 'COMMENT', literal: ' sample comment one', line: 2, column: 8, position: [7, 27] },
    { kind: 'COMMENT', literal: ' sample comment two', line: 3, column: 6, position: [33, 53] },
    { kind: 'EOF', literal: '', line: 4, column: 2, position: [56, 56] },
  ]);
});

test('function literal with block statement', () => {
  const source = '|x, y| { x + y; }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 1, column: 1, position: [0, 0] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 2, position: [1, 1] },
    { kind: ',', literal: ',', line: 1, column: 3, position: [2, 2] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 5, position: [4, 4] },
    { kind: '|', literal: '|', line: 1, column: 6, position: [5, 5] },
    { kind: '{', literal: '{', line: 1, column: 8, position: [7, 7] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 10, position: [9, 9] },
    { kind: '+', literal: '+', line: 1, column: 12, position: [11, 11] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 14, position: [13, 13] },
    { kind: ';', literal: ';', line: 1, column: 15, position: [14, 14] },
    { kind: '}', literal: '}', line: 1, column: 17, position: [16, 16] },
    { kind: 'EOF', literal: '', line: 1, column: 18, position: [16, 16] },
  ]);
});

test('function literal with expression statement', () => {
  const source = '|x, y| x + y';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 1, column: 1, position: [0, 0] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 2, position: [1, 1] },
    { kind: ',', literal: ',', line: 1, column: 3, position: [2, 2] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 5, position: [4, 4] },
    { kind: '|', literal: '|', line: 1, column: 6, position: [5, 5] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 8, position: [7, 7] },
    { kind: '+', literal: '+', line: 1, column: 10, position: [9, 9] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 12, position: [11, 11] },
    { kind: 'EOF', literal: '', line: 1, column: 13, position: [11, 11] },
  ]);
});

test('match expression', () => {
  const source = 'match x { 1 { "one" } [e] if e == 2 { "two" } _ { "three" } }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'MATCH', literal: 'match', line: 1, column: 1, position: [0, 4] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 7, position: [6, 6] },
    { kind: '{', literal: '{', line: 1, column: 9, position: [8, 8] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 11, position: [10, 10] },
    { kind: '{', literal: '{', line: 1, column: 13, position: [12, 12] },
    { kind: 'STRING', literal: 'one', line: 1, column: 17, position: [14, 18] },
    { kind: '}', literal: '}', line: 1, column: 21, position: [20, 20] },
    { kind: '[', literal: '[', line: 1, column: 23, position: [22, 22] },
    { kind: 'IDENTIFIER', literal: 'e', line: 1, column: 24, position: [23, 23] },
    { kind: ']', literal: ']', line: 1, column: 25, position: [24, 24] },
    { kind: 'IF', literal: 'if', line: 1, column: 27, position: [26, 27] },
    { kind: 'IDENTIFIER', literal: 'e', line: 1, column: 30, position: [29, 29] },
    { kind: '==', literal: '==', line: 1, column: 32, position: [31, 32] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 35, position: [34, 34] },
    { kind: '{', literal: '{', line: 1, column: 37, position: [36, 36] },
    { kind: 'STRING', literal: 'two', line: 1, column: 41, position: [38, 42] },
    { kind: '}', literal: '}', line: 1, column: 45, position: [44, 44] },
    { kind: '_', literal: '_', line: 1, column: 47, position: [46, 46] },
    { kind: '{', literal: '{', line: 1, column: 49, position: [48, 48] },
    { kind: 'STRING', literal: 'three', line: 1, column: 53, position: [50, 56] },
    { kind: '}', literal: '}', line: 1, column: 59, position: [58, 58] },
    { kind: '}', literal: '}', line: 1, column: 61, position: [60, 60] },
    { kind: 'EOF', literal: '', line: 1, column: 62, position: [60, 60] },
  ]);
});

test('infix backtick call', () => {
  const source = 'one `add` two';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'one', line: 1, column: 1, position: [0, 2] },
    { kind: '`', literal: '`', line: 1, column: 5, position: [4, 4] },
    { kind: 'IDENTIFIER', literal: 'add', line: 1, column: 6, position: [5, 7] },
    { kind: '`', literal: '`', line: 1, column: 9, position: [8, 8] },
    { kind: 'IDENTIFIER', literal: 'two', line: 1, column: 11, position: [10, 12] },
    { kind: 'EOF', literal: '', line: 1, column: 14, position: [12, 12] },
  ]);
});

test('partial application placeholder', () => {
  const source = '_ + 2; +(_, 2)';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '_', literal: '_', line: 1, column: 1, position: [0, 0] },
    { kind: '+', literal: '+', line: 1, column: 3, position: [2, 2] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 5, position: [4, 4] },
    { kind: ';', literal: ';', line: 1, column: 6, position: [5, 5] },
    { kind: '+', literal: '+', line: 1, column: 8, position: [7, 7] },
    { kind: '(', literal: '(', line: 1, column: 9, position: [8, 8] },
    { kind: '_', literal: '_', line: 1, column: 10, position: [9, 9] },
    { kind: ',', literal: ',', line: 1, column: 11, position: [10, 10] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 13, position: [12, 12] },
    { kind: ')', literal: ')', line: 1, column: 14, position: [13, 13] },
    { kind: 'EOF', literal: '', line: 1, column: 15, position: [13, 13] },
  ]);
});

test('function literal with parameter destructuring', () => {
  const source = '|x, [y, ..z]| x + y';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '|', literal: '|', line: 1, column: 1, position: [0, 0] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 2, position: [1, 1] },
    { kind: ',', literal: ',', line: 1, column: 3, position: [2, 2] },
    { kind: '[', literal: '[', line: 1, column: 5, position: [4, 4] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 6, position: [5, 5] },
    { kind: ',', literal: ',', line: 1, column: 7, position: [6, 6] },
    { kind: '..', literal: '..', line: 1, column: 9, position: [8, 9] },
    { kind: 'IDENTIFIER', literal: 'z', line: 1, column: 11, position: [10, 10] },
    { kind: ']', literal: ']', line: 1, column: 12, position: [11, 11] },
    { kind: '|', literal: '|', line: 1, column: 13, position: [12, 12] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 15, position: [14, 14] },
    { kind: '+', literal: '+', line: 1, column: 17, position: [16, 16] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 19, position: [18, 18] },
    { kind: 'EOF', literal: '', line: 1, column: 20, position: [18, 18] },
  ]);
});

test('list literal', () => {
  const source = '[1, 2.5, "hello"]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '[', literal: '[', line: 1, column: 1, position: [0, 0] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 2, position: [1, 1] },
    { kind: ',', literal: ',', line: 1, column: 3, position: [2, 2] },
    { kind: 'DECIMAL', literal: '2.5', line: 1, column: 5, position: [4, 6] },
    { kind: ',', literal: ',', line: 1, column: 8, position: [7, 7] },
    { kind: 'STRING', literal: 'hello', line: 1, column: 12, position: [9, 15] },
    { kind: ']', literal: ']', line: 1, column: 17, position: [16, 16] },
    { kind: 'EOF', literal: '', line: 1, column: 18, position: [16, 16] },
  ]);
});

test('hash literal', () => {
  const source = '#{"hello": {x}, 1: "2", [1, 2]: 1.4}';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '#{', literal: '#{', line: 1, column: 1, position: [0, 1] },
    { kind: 'STRING', literal: 'hello', line: 1, column: 5, position: [2, 8] },
    { kind: ':', literal: ':', line: 1, column: 10, position: [9, 9] },
    { kind: '{', literal: '{', line: 1, column: 12, position: [11, 11] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 13, position: [12, 12] },
    { kind: '}', literal: '}', line: 1, column: 14, position: [13, 13] },
    { kind: ',', literal: ',', line: 1, column: 15, position: [14, 14] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 17, position: [16, 16] },
    { kind: ':', literal: ':', line: 1, column: 18, position: [17, 17] },
    { kind: 'STRING', literal: '2', line: 1, column: 22, position: [19, 21] },
    { kind: ',', literal: ',', line: 1, column: 23, position: [22, 22] },
    { kind: '[', literal: '[', line: 1, column: 25, position: [24, 24] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 26, position: [25, 25] },
    { kind: ',', literal: ',', line: 1, column: 27, position: [26, 26] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 29, position: [28, 28] },
    { kind: ']', literal: ']', line: 1, column: 30, position: [29, 29] },
    { kind: ':', literal: ':', line: 1, column: 31, position: [30, 30] },
    { kind: 'DECIMAL', literal: '1.4', line: 1, column: 33, position: [32, 34] },
    { kind: '}', literal: '}', line: 1, column: 36, position: [35, 35] },
    { kind: 'EOF', literal: '', line: 1, column: 37, position: [35, 35] },
  ]);
});

test('set literal', () => {
  const source = '{1, 2, 3}';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: '{', literal: '{', line: 1, column: 1, position: [0, 0] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 2, position: [1, 1] },
    { kind: ',', literal: ',', line: 1, column: 3, position: [2, 2] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 5, position: [4, 4] },
    { kind: ',', literal: ',', line: 1, column: 6, position: [5, 5] },
    { kind: 'INTEGER', literal: '3', line: 1, column: 8, position: [7, 7] },
    { kind: '}', literal: '}', line: 1, column: 9, position: [8, 8] },
    { kind: 'EOF', literal: '', line: 1, column: 10, position: [8, 8] },
  ]);
});

test('bounded range', () => {
  const source = '1..10';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 2, position: [0, 0] },
    { kind: '..', literal: '..', line: 1, column: 3, position: [1, 2] },
    { kind: 'INTEGER', literal: '10', line: 1, column: 5, position: [3, 4] },
    { kind: 'EOF', literal: '', line: 1, column: 7, position: [4, 4] },
  ]);
});

test('unbounded range', () => {
  const source = '1..';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 2, position: [0, 0] },
    { kind: '..', literal: '..', line: 1, column: 3, position: [1, 2] },
    { kind: 'EOF', literal: '', line: 1, column: 5, position: [2, 2] },
  ]);
});

test('section', () => {
  const source = 'section_one: {}; section_two: "sample"';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'section_one', line: 1, column: 1, position: [0, 10] },
    { kind: ':', literal: ':', line: 1, column: 12, position: [11, 11] },
    { kind: '{', literal: '{', line: 1, column: 14, position: [13, 13] },
    { kind: '}', literal: '}', line: 1, column: 15, position: [14, 14] },
    { kind: ';', literal: ';', line: 1, column: 16, position: [15, 15] },
    { kind: 'IDENTIFIER', literal: 'section_two', line: 1, column: 18, position: [17, 27] },
    { kind: ':', literal: ':', line: 1, column: 29, position: [28, 28] },
    { kind: 'STRING', literal: 'sample', line: 1, column: 33, position: [30, 37] },
    { kind: 'EOF', literal: '', line: 1, column: 39, position: [37, 37] },
  ]);
});

test('section with sub-section', () => {
  const source = 'section_one: { section_two: "sample" }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'section_one', line: 1, column: 1, position: [0, 10] },
    { kind: ':', literal: ':', line: 1, column: 12, position: [11, 11] },
    { kind: '{', literal: '{', line: 1, column: 14, position: [13, 13] },
    { kind: 'IDENTIFIER', literal: 'section_two', line: 1, column: 16, position: [15, 25] },
    { kind: ':', literal: ':', line: 1, column: 27, position: [26, 26] },
    { kind: 'STRING', literal: 'sample', line: 1, column: 31, position: [28, 35] },
    { kind: '}', literal: '}', line: 1, column: 38, position: [37, 37] },
    { kind: 'EOF', literal: '', line: 1, column: 39, position: [37, 37] },
  ]);
});

test('assignment', () => {
  const source = 'let x = 1; let mut y = 1; let [x, y, ..z] = [1, 2, 3, 4]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'LET', literal: 'let', line: 1, column: 1, position: [0, 2] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 5, position: [4, 4] },
    { kind: '=', literal: '=', line: 1, column: 7, position: [6, 6] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 9, position: [8, 8] },
    { kind: ';', literal: ';', line: 1, column: 10, position: [9, 9] },
    { kind: 'LET', literal: 'let', line: 1, column: 12, position: [11, 13] },
    { kind: 'MUTABLE', literal: 'mut', line: 1, column: 16, position: [15, 17] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 20, position: [19, 19] },
    { kind: '=', literal: '=', line: 1, column: 22, position: [21, 21] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 24, position: [23, 23] },
    { kind: ';', literal: ';', line: 1, column: 25, position: [24, 24] },
    { kind: 'LET', literal: 'let', line: 1, column: 27, position: [26, 28] },
    { kind: '[', literal: '[', line: 1, column: 31, position: [30, 30] },
    { kind: 'IDENTIFIER', literal: 'x', line: 1, column: 32, position: [31, 31] },
    { kind: ',', literal: ',', line: 1, column: 33, position: [32, 32] },
    { kind: 'IDENTIFIER', literal: 'y', line: 1, column: 35, position: [34, 34] },
    { kind: ',', literal: ',', line: 1, column: 36, position: [35, 35] },
    { kind: '..', literal: '..', line: 1, column: 38, position: [37, 38] },
    { kind: 'IDENTIFIER', literal: 'z', line: 1, column: 40, position: [39, 39] },
    { kind: ']', literal: ']', line: 1, column: 41, position: [40, 40] },
    { kind: '=', literal: '=', line: 1, column: 43, position: [42, 42] },
    { kind: '[', literal: '[', line: 1, column: 45, position: [44, 44] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 46, position: [45, 45] },
    { kind: ',', literal: ',', line: 1, column: 47, position: [46, 46] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 49, position: [48, 48] },
    { kind: ',', literal: ',', line: 1, column: 50, position: [49, 49] },
    { kind: 'INTEGER', literal: '3', line: 1, column: 52, position: [51, 51] },
    { kind: ',', literal: ',', line: 1, column: 53, position: [52, 52] },
    { kind: 'INTEGER', literal: '4', line: 1, column: 55, position: [54, 54] },
    { kind: ']', literal: ']', line: 1, column: 56, position: [55, 55] },
    { kind: 'EOF', literal: '', line: 1, column: 57, position: [55, 55] },
  ]);
});

test('if expression', () => {
  const source = 'if 0 < 5 { 1 } else { 2 }';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IF', literal: 'if', line: 1, column: 1, position: [0, 1] },
    { kind: 'INTEGER', literal: '0', line: 1, column: 4, position: [3, 3] },
    { kind: '<', literal: '<', line: 1, column: 6, position: [5, 5] },
    { kind: 'INTEGER', literal: '5', line: 1, column: 8, position: [7, 7] },
    { kind: '{', literal: '{', line: 1, column: 10, position: [9, 9] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 12, position: [11, 11] },
    { kind: '}', literal: '}', line: 1, column: 14, position: [13, 13] },
    { kind: 'ELSE', literal: 'else', line: 1, column: 16, position: [15, 18] },
    { kind: '{', literal: '{', line: 1, column: 21, position: [20, 20] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 23, position: [22, 22] },
    { kind: '}', literal: '}', line: 1, column: 25, position: [24, 24] },
    { kind: 'EOF', literal: '', line: 1, column: 26, position: [24, 24] },
  ]);
});

test('call expression', () => {
  const source = 'add(1, 2)';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'add', line: 1, column: 1, position: [0, 2] },
    { kind: '(', literal: '(', line: 1, column: 4, position: [3, 3] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 5, position: [4, 4] },
    { kind: ',', literal: ',', line: 1, column: 6, position: [5, 5] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 8, position: [7, 7] },
    { kind: ')', literal: ')', line: 1, column: 9, position: [8, 8] },
    { kind: 'EOF', literal: '', line: 1, column: 10, position: [8, 8] },
  ]);
});

test('multiline source', () => {
  const source = `
let a = 1;
let b = 1.5;
`.trim();

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'LET', literal: 'let', line: 1, column: 1, position: [0, 2] },
    { kind: 'IDENTIFIER', literal: 'a', line: 1, column: 5, position: [4, 4] },
    { kind: '=', literal: '=', line: 1, column: 7, position: [6, 6] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 9, position: [8, 8] },
    { kind: ';', literal: ';', line: 1, column: 10, position: [9, 9] },
    { kind: 'LET', literal: 'let', line: 2, column: 0, position: [11, 13] },
    { kind: 'IDENTIFIER', literal: 'b', line: 2, column: 4, position: [15, 15] },
    { kind: '=', literal: '=', line: 2, column: 6, position: [17, 17] },
    { kind: 'DECIMAL', literal: '1.5', line: 2, column: 8, position: [19, 21] },
    { kind: ';', literal: ';', line: 2, column: 11, position: [22, 22] },
    { kind: 'EOF', literal: '', line: 2, column: 12, position: [22, 22] },
  ]);
});

test('minus with negative value', () => {
  const source = '1 - -2';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 1, position: [0, 0] },
    { kind: '-', literal: '-', line: 1, column: 3, position: [2, 2] },
    { kind: '-', literal: '-', line: 1, column: 5, position: [4, 4] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 6, position: [5, 5] },
    { kind: 'EOF', literal: '', line: 1, column: 7, position: [5, 5] },
  ]);
});

test('function composition', () => {
  const source = 'inc >> dec';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'inc', line: 1, column: 1, position: [0, 2] },
    { kind: '>>', literal: '>>', line: 1, column: 5, position: [4, 5] },
    { kind: 'IDENTIFIER', literal: 'dec', line: 1, column: 8, position: [7, 9] },
    { kind: 'EOF', literal: '', line: 1, column: 11, position: [9, 9] },
  ]);
});

test('function threading', () => {
  const source = '1 |> inc |> dec';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'INTEGER', literal: '1', line: 1, column: 1, position: [0, 0] },
    { kind: '|>', literal: '|>', line: 1, column: 3, position: [2, 3] },
    { kind: 'IDENTIFIER', literal: 'inc', line: 1, column: 6, position: [5, 7] },
    { kind: '|>', literal: '|>', line: 1, column: 10, position: [9, 10] },
    { kind: 'IDENTIFIER', literal: 'dec', line: 1, column: 13, position: [12, 14] },
    { kind: 'EOF', literal: '', line: 1, column: 16, position: [14, 14] },
  ]);
});

test('indexing', () => {
  const source = 'list[1]; list[-1]; list[2..5]; list[-2..]; list[0..-2]; list["key"]';

  const tokens = tokenize(source);

  expect(tokens).toEqual([
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 1, position: [0, 3] },
    { kind: '[', literal: '[', line: 1, column: 5, position: [4, 4] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 6, position: [5, 5] },
    { kind: ']', literal: ']', line: 1, column: 7, position: [6, 6] },
    { kind: ';', literal: ';', line: 1, column: 8, position: [7, 7] },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 10, position: [9, 12] },
    { kind: '[', literal: '[', line: 1, column: 14, position: [13, 13] },
    { kind: '-', literal: '-', line: 1, column: 15, position: [14, 14] },
    { kind: 'INTEGER', literal: '1', line: 1, column: 16, position: [15, 15] },
    { kind: ']', literal: ']', line: 1, column: 17, position: [16, 16] },
    { kind: ';', literal: ';', line: 1, column: 18, position: [17, 17] },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 20, position: [19, 22] },
    { kind: '[', literal: '[', line: 1, column: 24, position: [23, 23] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 26, position: [24, 24] },
    { kind: '..', literal: '..', line: 1, column: 27, position: [25, 26] },
    { kind: 'INTEGER', literal: '5', line: 1, column: 29, position: [27, 27] },
    { kind: ']', literal: ']', line: 1, column: 30, position: [28, 28] },
    { kind: ';', literal: ';', line: 1, column: 31, position: [29, 29] },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 33, position: [31, 34] },
    { kind: '[', literal: '[', line: 1, column: 37, position: [35, 35] },
    { kind: '-', literal: '-', line: 1, column: 38, position: [36, 36] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 40, position: [37, 37] },
    { kind: '..', literal: '..', line: 1, column: 41, position: [38, 39] },
    { kind: ']', literal: ']', line: 1, column: 43, position: [40, 40] },
    { kind: ';', literal: ';', line: 1, column: 44, position: [41, 41] },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 46, position: [43, 46] },
    { kind: '[', literal: '[', line: 1, column: 50, position: [47, 47] },
    { kind: 'INTEGER', literal: '0', line: 1, column: 52, position: [48, 48] },
    { kind: '..', literal: '..', line: 1, column: 53, position: [49, 50] },
    { kind: '-', literal: '-', line: 1, column: 55, position: [51, 51] },
    { kind: 'INTEGER', literal: '2', line: 1, column: 56, position: [52, 52] },
    { kind: ']', literal: ']', line: 1, column: 57, position: [53, 53] },
    { kind: ';', literal: ';', line: 1, column: 58, position: [54, 54] },
    { kind: 'IDENTIFIER', literal: 'list', line: 1, column: 60, position: [56, 59] },
    { kind: '[', literal: '[', line: 1, column: 64, position: [60, 60] },
    { kind: 'STRING', literal: 'key', line: 1, column: 67, position: [61, 65] },
    { kind: ']', literal: ']', line: 1, column: 70, position: [66, 66] },
    { kind: 'EOF', literal: '', line: 1, column: 71, position: [66, 66] },
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
