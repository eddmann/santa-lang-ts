import { Lexer } from '../lexer';
import { AST, Parser, printer } from '../parser';

test('integer', () => {
  const source = '1';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: { kind: 'INTEGER', value: 1, source: { line: 0, column: 0 } },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('decimal', () => {
  const source = '1.5';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: { kind: 'DECIMAL', value: 1.5, source: { line: 0, column: 0 } },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('string', () => {
  const source = '"Hello, world!"';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: { kind: 'STRING', value: 'Hello, world!', source: { line: 0, column: 2 } },
        source: { line: 0, column: 2 },
      },
    ],
    source: { line: 0, column: 2 },
  });
});

test('boolean', () => {
  const source = 'true; false;';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: { kind: 'BOOLEAN', value: true, source: { line: 0, column: 0 } },
        source: { line: 0, column: 0 },
      },
      {
        kind: 'EXPRESSION',
        expression: { kind: 'BOOLEAN', value: false, source: { line: 0, column: 6 } },
        source: { line: 0, column: 6 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('nil', () => {
  const source = 'nil';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: { kind: 'NIL', source: { line: 0, column: 0 } },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('comments', () => {
  const source = `
    1 // sample comment one
    // sample comment two
  `;

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: { kind: 'INTEGER', value: 1, source: { line: 1, column: 4 } },
        source: { line: 1, column: 4 },
      },
      { kind: 'COMMENT', value: ' sample comment one', source: { line: 1, column: 8 } },
      { kind: 'COMMENT', value: ' sample comment two', source: { line: 2, column: 6 } },
    ],
    source: { line: 1, column: 4 },
  });
});

test('infix function call', () => {
  const source = 'one `add` two';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INFIX_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: 'add', source: { line: 0, column: 5 } },
          arguments: [
            { kind: 'IDENTIFIER', value: 'one', source: { line: 0, column: 0 } },
            { kind: 'IDENTIFIER', value: 'two', source: { line: 0, column: 10 } },
          ],
          source: { line: 0, column: 4 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('function literal with block statement', () => {
  const source = '|x, y| { x + y; }';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'FUNCTION_LITERAL',
          parameters: [
            { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 1 } },
            { kind: 'IDENTIFIER', value: 'y', source: { line: 0, column: 4 } },
          ],
          body: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: {
                  kind: 'INFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 11 } },
                  arguments: [
                    { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 9 } },
                    { kind: 'IDENTIFIER', value: 'y', source: { line: 0, column: 13 } },
                  ],
                  source: { line: 0, column: 11 },
                },
                source: { line: 0, column: 9 },
              },
            ],
            source: { line: 0, column: 7 },
          },
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('function literal with expression statement', () => {
  const source = '|x, y| x + y';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'FUNCTION_LITERAL',
          parameters: [
            { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 1 } },
            { kind: 'IDENTIFIER', value: 'y', source: { line: 0, column: 4 } },
          ],
          body: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: {
                  kind: 'INFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 9 } },
                  arguments: [
                    { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 7 } },
                    { kind: 'IDENTIFIER', value: 'y', source: { line: 0, column: 11 } },
                  ],
                  source: { line: 0, column: 9 },
                },
                source: { line: 0, column: 7 },
              },
            ],
          },
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('match expression with list destructing', () => {
  const source =
    'match x { [] { "empty" }, [x] { "one items" }, [x, ..xs] { "many items" }, _ { "unknown" } }';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'MATCH_EXPRESSION',
          subject: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 6 } },
          cases: [
            {
              pattern: {
                kind: 'LIST_MATCH_PATTERN',
                elements: [],
                source: { line: 0, column: 10 },
              },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'empty', source: { line: 0, column: 17 } },
                    source: { line: 0, column: 17 },
                  },
                ],
                source: { line: 0, column: 13 },
              },
            },
            {
              pattern: {
                kind: 'LIST_MATCH_PATTERN',
                elements: [{ kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 27 } }],
                source: { line: 0, column: 26 },
              },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'STRING',
                      value: 'one items',
                      source: { line: 0, column: 34 },
                    },
                    source: { line: 0, column: 34 },
                  },
                ],
                source: { line: 0, column: 30 },
              },
            },
            {
              pattern: {
                kind: 'LIST_MATCH_PATTERN',
                elements: [
                  { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 48 } },
                  {
                    kind: 'REST_ELEMENT',
                    argument: { kind: 'IDENTIFIER', value: 'xs' },
                    source: { line: 0, column: 53 },
                  },
                ],
                source: { line: 0, column: 47 },
              },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'STRING',
                      value: 'many items',
                      source: { line: 0, column: 61 },
                    },
                    source: { line: 0, column: 61 },
                  },
                ],
                source: { line: 0, column: 57 },
              },
            },
            {
              pattern: { kind: 'PLACEHOLDER', source: { line: 0, column: 75 } },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'STRING',
                      value: 'unknown',
                      source: { line: 0, column: 81 },
                    },
                    source: { line: 0, column: 81 },
                  },
                ],
                source: { line: 0, column: 77 },
              },
            },
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('match expression with primitives', () => {
  const source = 'match x { 1 { "one" }, 2.0 { "two" }, true { "three" }, "four" { 4 } }';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'MATCH_EXPRESSION',
          subject: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 6 } },
          cases: [
            {
              pattern: { kind: 'INTEGER', value: 1, source: { line: 0, column: 10 } },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'one', source: { line: 0, column: 16 } },
                    source: { line: 0, column: 16 },
                  },
                ],
                source: { line: 0, column: 12 },
              },
            },
            {
              pattern: { kind: 'DECIMAL', value: 2, source: { line: 0, column: 23 } },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'two', source: { line: 0, column: 31 } },
                    source: { line: 0, column: 31 },
                  },
                ],
                source: { line: 0, column: 27 },
              },
            },
            {
              pattern: { kind: 'BOOLEAN', value: true, source: { line: 0, column: 38 } },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'three', source: { line: 0, column: 47 } },
                    source: { line: 0, column: 47 },
                  },
                ],
                source: { line: 0, column: 43 },
              },
            },
            {
              pattern: { kind: 'STRING', value: 'four', source: { line: 0, column: 58 } },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'INTEGER', value: 4, source: { line: 0, column: 65 } },
                    source: { line: 0, column: 65 },
                  },
                ],
                source: { line: 0, column: 63 },
              },
            },
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('match expression with if clause', () => {
  const source =
    'match x { 1 if 1 != 2 { "one" }, 2.0 if true && !false { "two" }, e if e > 3 { "greater than three" } }';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'MATCH_EXPRESSION',
          subject: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 6 } },
          cases: [
            {
              pattern: { kind: 'INTEGER', value: 1, source: { line: 0, column: 10 } },
              guard: {
                kind: 'INFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: '!=', source: { line: 0, column: 17 } },
                arguments: [
                  { kind: 'INTEGER', value: 1, source: { line: 0, column: 15 } },
                  { kind: 'INTEGER', value: 2, source: { line: 0, column: 20 } },
                ],
                source: { line: 0, column: 17 },
              },
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'one', source: { line: 0, column: 26 } },
                    source: { line: 0, column: 26 },
                  },
                ],
                source: { line: 0, column: 22 },
              },
            },
            {
              pattern: { kind: 'DECIMAL', value: 2, source: { line: 0, column: 33 } },
              guard: {
                kind: 'INFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: '&&', source: { line: 0, column: 45 } },
                arguments: [
                  { kind: 'BOOLEAN', value: true, source: { line: 0, column: 40 } },
                  {
                    kind: 'PREFIX_EXPRESSION',
                    function: {
                      kind: 'IDENTIFIER',
                      value: 'unary_!',
                      source: { line: 0, column: 49 },
                    },
                    argument: { kind: 'BOOLEAN', value: false, source: { line: 0, column: 49 } },
                    source: { line: 0, column: 48 },
                  },
                ],
                source: { line: 0, column: 45 },
              },
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'two', source: { line: 0, column: 59 } },
                    source: { line: 0, column: 59 },
                  },
                ],
                source: { line: 0, column: 55 },
              },
            },
            {
              pattern: { kind: 'IDENTIFIER', value: 'e', source: { line: 0, column: 66 } },
              guard: {
                kind: 'INFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: '>', source: { line: 0, column: 73 } },
                arguments: [
                  { kind: 'IDENTIFIER', value: 'e', source: { line: 0, column: 71 } },
                  { kind: 'INTEGER', value: 3, source: { line: 0, column: 75 } },
                ],
                source: { line: 0, column: 73 },
              },
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'STRING',
                      value: 'greater than three',
                      source: { line: 0, column: 81 },
                    },
                    source: { line: 0, column: 81 },
                  },
                ],
                source: { line: 0, column: 77 },
              },
            },
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('partial application using placeholders', () => {
  const source = '_ + 2; +(_, 2)';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INFIX_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 2 } },
          arguments: [
            { kind: 'PLACEHOLDER', source: { line: 0, column: 0 } },
            { kind: 'INTEGER', value: 2, source: { line: 0, column: 4 } },
          ],
          source: { line: 0, column: 2 },
        },
        source: { line: 0, column: 0 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'CALL_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 7 } },
          arguments: [
            { kind: 'PLACEHOLDER', source: { line: 0, column: 9 } },
            { kind: 'INTEGER', value: 2, source: { line: 0, column: 12 } },
          ],
          source: { line: 0, column: 8 },
        },
        source: { line: 0, column: 7 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('function literal with parameter destructuring', () => {
  const source = '|x, [y, ..z], ..rest| x + y';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'FUNCTION_LITERAL',
          parameters: [
            { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 1 } },
            {
              kind: 'LIST_DESTRUCTURE_PATTERN',
              elements: [
                { kind: 'IDENTIFIER', value: 'y', source: { line: 0, column: 5 } },
                {
                  kind: 'REST_ELEMENT',
                  argument: { kind: 'IDENTIFIER', value: 'z', source: { line: 0, column: 8 } },
                  source: { line: 0, column: 8 },
                },
              ],
              source: { line: 0, column: 4 },
            },
            {
              kind: 'REST_ELEMENT',
              argument: { kind: 'IDENTIFIER', value: 'rest', source: { line: 0, column: 14 } },
              source: { line: 0, column: 14 },
            },
          ],
          body: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: {
                  kind: 'INFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 24 } },
                  arguments: [
                    { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 22 } },
                    { kind: 'IDENTIFIER', value: 'y', source: { line: 0, column: 26 } },
                  ],
                  source: { line: 0, column: 24 },
                },
                source: { line: 0, column: 22 },
              },
            ],
          },
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('list literal', () => {
  const source = '[1, 2.5, "hello"]';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'LIST_EXPRESSION',
          elements: [
            { kind: 'INTEGER', value: 1, source: { line: 0, column: 1 } },
            { kind: 'DECIMAL', value: 2.5, source: { line: 0, column: 4 } },
            { kind: 'STRING', value: 'hello', source: { line: 0, column: 11 } },
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('hash literal', () => {
  const source = '#{"hello": #{x}, 1: "2", [1, 2]: 1.4}';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'HASH_EXPRESSION',
          pairs: [
            [
              { kind: 'STRING', value: 'hello', source: { line: 0, column: 4 } },
              {
                kind: 'HASH_EXPRESSION',
                pairs: [
                  [
                    { kind: 'STRING', value: 'x', source: { line: 0, column: 13 } },
                    { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 13 } },
                  ],
                ],
                source: { line: 0, column: 11 },
              },
            ],
            [
              { kind: 'INTEGER', value: 1, source: { line: 0, column: 17 } },
              { kind: 'STRING', value: '2', source: { line: 0, column: 22 } },
            ],
            [
              {
                kind: 'LIST_EXPRESSION',
                elements: [
                  { kind: 'INTEGER', value: 1, source: { line: 0, column: 26 } },
                  { kind: 'INTEGER', value: 2, source: { line: 0, column: 29 } },
                ],
                source: { line: 0, column: 25 },
              },
              { kind: 'DECIMAL', value: 1.4, source: { line: 0, column: 33 } },
            ],
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('set literal', () => {
  const source = '{1, 2, 3}';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'SET_EXPRESSION',
          elements: [
            { kind: 'INTEGER', value: 1, source: { line: 0, column: 1 } },
            { kind: 'INTEGER', value: 2, source: { line: 0, column: 4 } },
            { kind: 'INTEGER', value: 3, source: { line: 0, column: 7 } },
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('let assignment', () => {
  const source = 'let x = 1;';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'LET',
        name: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 4 } },
        value: { kind: 'INTEGER', value: 1, source: { line: 0, column: 8 } },
        isMutable: false,
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('let mut assignment', () => {
  const source = 'let mut x = 1; x = 2;';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'LET',
        name: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 8 } },
        value: { kind: 'INTEGER', value: 1, source: { line: 0, column: 12 } },
        isMutable: true,
        source: { line: 0, column: 0 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'ASSIGNMENT',
          name: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 15 } },
          value: { kind: 'INTEGER', value: 2, source: { line: 0, column: 19 } },
          source: { line: 0, column: 17 },
        },
        source: { line: 0, column: 15 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('let destructuring', () => {
  const source = 'let [a, b, [c, d], ..e] = [1, 2, [3, 4], 5]';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'LET',
        name: {
          kind: 'LIST_DESTRUCTURE_PATTERN',
          elements: [
            { kind: 'IDENTIFIER', value: 'a', source: { line: 0, column: 5 } },
            { kind: 'IDENTIFIER', value: 'b', source: { line: 0, column: 8 } },
            {
              kind: 'LIST_DESTRUCTURE_PATTERN',
              elements: [
                { kind: 'IDENTIFIER', value: 'c', source: { line: 0, column: 12 } },
                { kind: 'IDENTIFIER', value: 'd', source: { line: 0, column: 15 } },
              ],
              source: { line: 0, column: 11 },
            },
            {
              kind: 'REST_ELEMENT',
              argument: { kind: 'IDENTIFIER', value: 'e', source: { line: 0, column: 19 } },
              source: { line: 0, column: 19 },
            },
          ],
          source: { line: 0, column: 4 },
        },
        value: {
          kind: 'LIST_EXPRESSION',
          elements: [
            { kind: 'INTEGER', value: 1, source: { line: 0, column: 27 } },
            { kind: 'INTEGER', value: 2, source: { line: 0, column: 30 } },
            {
              kind: 'LIST_EXPRESSION',
              elements: [
                { kind: 'INTEGER', value: 3, source: { line: 0, column: 34 } },
                { kind: 'INTEGER', value: 4, source: { line: 0, column: 37 } },
              ],
              source: { line: 0, column: 33 },
            },
            { kind: 'INTEGER', value: 5, source: { line: 0, column: 41 } },
          ],
          source: { line: 0, column: 26 },
        },
        isMutable: false,
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('list spread', () => {
  const source = '[1, ..xs, ..[1, 2, 3]]';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'LIST_EXPRESSION',
          elements: [
            { kind: 'INTEGER', value: 1, source: { line: 0, column: 1 } },
            {
              kind: 'SPREAD_ELEMENT',
              value: { kind: 'IDENTIFIER', value: 'xs', source: { line: 0, column: 6 } },
              source: { line: 0, column: 4 },
            },
            {
              kind: 'SPREAD_ELEMENT',
              value: {
                kind: 'LIST_EXPRESSION',
                elements: [
                  { kind: 'INTEGER', value: 1, source: { line: 0, column: 13 } },
                  { kind: 'INTEGER', value: 2, source: { line: 0, column: 16 } },
                  { kind: 'INTEGER', value: 3, source: { line: 0, column: 19 } },
                ],
                source: { line: 0, column: 12 },
              },
              source: { line: 0, column: 10 },
            },
          ],
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('if expression', () => {
  const source = 'if 0 < 5 { 1 } else { 2 }';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'IF_EXPRESSION',
          condition: {
            kind: 'INFIX_EXPRESSION',
            function: { kind: 'IDENTIFIER', value: '<', source: { line: 0, column: 5 } },
            arguments: [
              { kind: 'INTEGER', value: 0, source: { line: 0, column: 3 } },
              { kind: 'INTEGER', value: 5, source: { line: 0, column: 7 } },
            ],
            source: { line: 0, column: 5 },
          },
          consequence: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: { kind: 'INTEGER', value: 1, source: { line: 0, column: 11 } },
                source: { line: 0, column: 11 },
              },
            ],
            source: { line: 0, column: 9 },
          },
          alternative: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: { kind: 'INTEGER', value: 2, source: { line: 0, column: 22 } },
                source: { line: 0, column: 22 },
              },
            ],
            source: { line: 0, column: 20 },
          },
          source: { line: 0, column: 0 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('call expression', () => {
  const source = 'add(1, 2)';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'CALL_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: 'add', source: { line: 0, column: 0 } },
          arguments: [
            { kind: 'INTEGER', value: 1, source: { line: 0, column: 4 } },
            { kind: 'INTEGER', value: 2, source: { line: 0, column: 7 } },
          ],
          source: { line: 0, column: 3 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('bounded range', () => {
  const source = '1..10';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'RANGE_EXPRESSION',
          start: { kind: 'INTEGER', value: 1, source: { line: 0, column: 1 } },
          end: { kind: 'INTEGER', value: 10, source: { line: 0, column: 4 } },
          source: { line: 0, column: 2 },
        },
        source: { line: 0, column: 1 },
      },
    ],
    source: { line: 0, column: 1 },
  });
});

test('unbounded range', () => {
  const source = '1..';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'RANGE_EXPRESSION',
          start: { kind: 'INTEGER', value: 1, source: { line: 0, column: 1 } },
          end: { kind: 'INTEGER', value: Infinity, source: { line: 0, column: 2 } },
          source: { line: 0, column: 2 },
        },
        source: { line: 0, column: 1 },
      },
    ],
    source: { line: 0, column: 1 },
  });
});

test('range using identifier', () => {
  const source = '0..x';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'RANGE_EXPRESSION',
          start: { kind: 'INTEGER', value: 0, source: { line: 0, column: 1 } },
          end: { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 4 } },
          source: { line: 0, column: 2 },
        },
        source: { line: 0, column: 1 },
      },
    ],
    source: { line: 0, column: 1 },
  });
});

test('sections', () => {
  const source = 'section_one: {"sample"}; section_two: "sample"';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'SECTION',
        name: { kind: 'IDENTIFIER', value: 'section_one', source: { line: 0, column: 0 } },
        section: {
          kind: 'BLOCK_STATEMENT',
          statements: [
            {
              kind: 'EXPRESSION',
              expression: { kind: 'STRING', value: 'sample', source: { line: 0, column: 16 } },
              source: { line: 0, column: 16 },
            },
          ],
          source: { line: 0, column: 13 },
        },
        source: { line: 0, column: 0 },
      },
      {
        kind: 'SECTION',
        name: { kind: 'IDENTIFIER', value: 'section_two', source: { line: 0, column: 25 } },
        section: {
          kind: 'BLOCK_STATEMENT',
          statements: [
            {
              kind: 'EXPRESSION',
              expression: { kind: 'STRING', value: 'sample', source: { line: 0, column: 40 } },
              source: { line: 0, column: 40 },
            },
          ],
        },
        source: { line: 0, column: 25 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('section with sub-section', () => {
  const source = 'section_one: { section_two: "sample" }';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'SECTION',
        name: { kind: 'IDENTIFIER', value: 'section_one', source: { line: 0, column: 0 } },
        section: {
          kind: 'BLOCK_STATEMENT',
          statements: [
            {
              kind: 'SECTION',
              name: { kind: 'IDENTIFIER', value: 'section_two', source: { line: 0, column: 15 } },
              section: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'STRING',
                      value: 'sample',
                      source: { line: 0, column: 30 },
                    },
                    source: { line: 0, column: 30 },
                  },
                ],
              },
              source: { line: 0, column: 15 },
            },
          ],
          source: { line: 0, column: 13 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('minus prefix/infix operation', () => {
  const source = '4 - -4 - 5';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INFIX_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '-', source: { line: 0, column: 7 } },
          arguments: [
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '-', source: { line: 0, column: 2 } },
              arguments: [
                { kind: 'INTEGER', value: 4, source: { line: 0, column: 0 } },
                {
                  kind: 'PREFIX_EXPRESSION',
                  function: {
                    kind: 'IDENTIFIER',
                    value: 'unary_-',
                    source: { line: 0, column: 5 },
                  },
                  argument: { kind: 'INTEGER', value: 4, source: { line: 0, column: 5 } },
                  source: { line: 0, column: 4 },
                },
              ],
              source: { line: 0, column: 2 },
            },
            { kind: 'INTEGER', value: 5, source: { line: 0, column: 9 } },
          ],
          source: { line: 0, column: 7 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('multiple prefix boolean negations', () => {
  const source = '!true || !!false';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INFIX_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '||', source: { line: 0, column: 6 } },
          arguments: [
            {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_!', source: { line: 0, column: 1 } },
              argument: { kind: 'BOOLEAN', value: true, source: { line: 0, column: 1 } },
              source: { line: 0, column: 0 },
            },
            {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_!', source: { line: 0, column: 10 } },
              argument: {
                kind: 'PREFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: 'unary_!', source: { line: 0, column: 11 } },
                argument: { kind: 'BOOLEAN', value: false, source: { line: 0, column: 11 } },
                source: { line: 0, column: 10 },
              },
              source: { line: 0, column: 9 },
            },
          ],
          source: { line: 0, column: 6 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('function composition', () => {
  const source = 'inc >> dec';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'FUNCTION_COMPOSITON',
          functions: [
            { kind: 'IDENTIFIER', value: 'inc', source: { line: 0, column: 0 } },
            { kind: 'IDENTIFIER', value: 'dec', source: { line: 0, column: 7 } },
          ],
          source: { line: 0, column: 4 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('function threading with call expression', () => {
  const source = '[1, 2, 3] |> map(|x| x + 1)';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'FUNCTION_THEAD',
          initial: {
            kind: 'LIST_EXPRESSION',
            elements: [
              { kind: 'INTEGER', value: 1, source: { line: 0, column: 1 } },
              { kind: 'INTEGER', value: 2, source: { line: 0, column: 4 } },
              { kind: 'INTEGER', value: 3, source: { line: 0, column: 7 } },
            ],
            source: { line: 0, column: 0 },
          },
          functions: [
            {
              kind: 'CALL_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'map', source: { line: 0, column: 13 } },
              arguments: [
                {
                  kind: 'FUNCTION_LITERAL',
                  parameters: [{ kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 18 } }],
                  body: {
                    kind: 'BLOCK_STATEMENT',
                    statements: [
                      {
                        kind: 'EXPRESSION',
                        expression: {
                          kind: 'INFIX_EXPRESSION',
                          function: {
                            kind: 'IDENTIFIER',
                            value: '+',
                            source: { line: 0, column: 23 },
                          },
                          arguments: [
                            { kind: 'IDENTIFIER', value: 'x', source: { line: 0, column: 21 } },
                            { kind: 'INTEGER', value: 1, source: { line: 0, column: 25 } },
                          ],
                          source: { line: 0, column: 23 },
                        },
                        source: { line: 0, column: 21 },
                      },
                    ],
                  },
                  source: { line: 0, column: 17 },
                },
              ],
              source: { line: 0, column: 16 },
            },
          ],
          source: { line: 0, column: 10 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('logical and', () => {
  const source = '1 == 1 && 1 > 2';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INFIX_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '&&', source: { line: 0, column: 7 } },
          arguments: [
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '==', source: { line: 0, column: 2 } },
              arguments: [
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 0 } },
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 5 } },
              ],
              source: { line: 0, column: 2 },
            },
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '>', source: { line: 0, column: 12 } },
              arguments: [
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 10 } },
                { kind: 'INTEGER', value: 2, source: { line: 0, column: 14 } },
              ],
              source: { line: 0, column: 12 },
            },
          ],
          source: { line: 0, column: 7 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('logical or', () => {
  const source = '1 == 1 || 1 > 2';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INFIX_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '||', source: { line: 0, column: 7 } },
          arguments: [
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '==', source: { line: 0, column: 2 } },
              arguments: [
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 0 } },
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 5 } },
              ],
              source: { line: 0, column: 2 },
            },
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '>', source: { line: 0, column: 12 } },
              arguments: [
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 10 } },
                { kind: 'INTEGER', value: 2, source: { line: 0, column: 14 } },
              ],
              source: { line: 0, column: 12 },
            },
          ],
          source: { line: 0, column: 7 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('function threading with function literal', () => {
  const source = '1 |> add(1) |> |a| { a + 1 } |> inc |> _ + 1';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'FUNCTION_THEAD',
          initial: { kind: 'INTEGER', value: 1, source: { line: 0, column: 0 } },
          functions: [
            {
              kind: 'CALL_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'add', source: { line: 0, column: 5 } },
              arguments: [{ kind: 'INTEGER', value: 1, source: { line: 0, column: 9 } }],
              source: { line: 0, column: 8 },
            },
            {
              kind: 'FUNCTION_LITERAL',
              parameters: [{ kind: 'IDENTIFIER', value: 'a', source: { line: 0, column: 16 } }],
              body: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'INFIX_EXPRESSION',
                      function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 23 } },
                      arguments: [
                        { kind: 'IDENTIFIER', value: 'a', source: { line: 0, column: 21 } },
                        { kind: 'INTEGER', value: 1, source: { line: 0, column: 25 } },
                      ],
                      source: { line: 0, column: 23 },
                    },
                    source: { line: 0, column: 21 },
                  },
                ],
                source: { line: 0, column: 19 },
              },
              source: { line: 0, column: 15 },
            },
            { kind: 'IDENTIFIER', value: 'inc', source: { line: 0, column: 32 } },
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '+', source: { line: 0, column: 41 } },
              arguments: [
                { kind: 'PLACEHOLDER', source: { line: 0, column: 39 } },
                { kind: 'INTEGER', value: 1, source: { line: 0, column: 43 } },
              ],
              source: { line: 0, column: 41 },
            },
          ],
          source: { line: 0, column: 2 },
        },
        source: { line: 0, column: 0 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

test('indexing', () => {
  const source = 'list[1]; list[-1]; list[2..5]; list[-2..]; list[0..-2]; list["key"]';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list', source: { line: 0, column: 0 } },
          index: { kind: 'INTEGER', value: 1, source: { line: 0, column: 5 } },
          source: { line: 0, column: 4 },
        },
        source: { line: 0, column: 0 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list', source: { line: 0, column: 9 } },
          index: {
            kind: 'PREFIX_EXPRESSION',
            function: { kind: 'IDENTIFIER', value: 'unary_-', source: { line: 0, column: 15 } },
            argument: { kind: 'INTEGER', value: 1, source: { line: 0, column: 15 } },
            source: { line: 0, column: 14 },
          },
          source: { line: 0, column: 13 },
        },
        source: { line: 0, column: 9 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list', source: { line: 0, column: 19 } },
          index: {
            kind: 'RANGE_EXPRESSION',
            start: { kind: 'INTEGER', value: 2, source: { line: 0, column: 25 } },
            end: { kind: 'INTEGER', value: 5, source: { line: 0, column: 28 } },
            source: { line: 0, column: 26 },
          },
          source: { line: 0, column: 23 },
        },
        source: { line: 0, column: 19 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list', source: { line: 0, column: 32 } },
          index: {
            kind: 'RANGE_EXPRESSION',
            start: {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_-', source: { line: 0, column: 39 } },
              argument: { kind: 'INTEGER', value: 2, source: { line: 0, column: 39 } },
              source: { line: 0, column: 37 },
            },
            end: { kind: 'INTEGER', value: Infinity, source: { line: 0, column: 40 } },
            source: { line: 0, column: 40 },
          },
          source: { line: 0, column: 36 },
        },
        source: { line: 0, column: 32 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list', source: { line: 0, column: 45 } },
          index: {
            kind: 'RANGE_EXPRESSION',
            start: { kind: 'INTEGER', value: 0, source: { line: 0, column: 51 } },
            end: {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_-', source: { line: 0, column: 55 } },
              argument: { kind: 'INTEGER', value: 2, source: { line: 0, column: 55 } },
              source: { line: 0, column: 54 },
            },
            source: { line: 0, column: 52 },
          },
          source: { line: 0, column: 49 },
        },
        source: { line: 0, column: 45 },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list', source: { line: 0, column: 59 } },
          index: { kind: 'STRING', value: 'key', source: { line: 0, column: 66 } },
          source: { line: 0, column: 63 },
        },
        source: { line: 0, column: 59 },
      },
    ],
    source: { line: 0, column: 0 },
  });
});

describe('operator precedence', () => {
  const cases = [
    {
      input: '-a * b',
      expected: '(-a * b);',
      description: 'prefix operator and multiplication',
    },
    {
      input: '!-a',
      expected: '!-a;',
      description: 'two prefix operators',
    },
    {
      input: 'a + b + c',
      expected: '((a + b) + c);',
      description: 'addition and addition',
    },
    {
      input: 'a + b - c',
      expected: '((a + b) - c);',
      description: 'addition and subtraction',
    },
    {
      input: 'a * b * c',
      expected: '((a * b) * c);',
      description: 'multiplication and multiplication',
    },
    {
      input: 'a * b / c',
      expected: '((a * b) / c);',
      description: 'multiplication and division',
    },
    {
      input: 'a + b / c',
      expected: '(a + (b / c));',
      description: 'addition and division',
    },
    {
      input: 'a + b * c + d / e - f',
      expected: '(((a + (b * c)) + (d / e)) - f);',
      description: 'multiple arithmetic operators',
    },
    {
      input: '3 + 4; -5 * 5',
      expected: '(3 + 4);\n(-5 * 5);',
      description: 'multiple statements',
    },
    {
      input: '5 > 4 == 3 < 4',
      expected: '((5 > 4) == (3 < 4));',
      description: 'greater than, less than, and equality',
    },
    {
      input: '5 < 4 != 3 > 4',
      expected: '((5 < 4) != (3 > 4));',
      description: 'greater than, less than, and inequality',
    },
    {
      input: '3 + 4 * 5 == 3 * 1 + 4 * 5',
      expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)));',
      description: 'arithmetic operators and comparison operators',
    },
    {
      input: '1 + (2 + 3) + 4',
      expected: '((1 + (2 + 3)) + 4);',
      description: 'grouped expressions with addition',
    },
    {
      input: '(5 + 5) * 2',
      expected: '((5 + 5) * 2);',
      description: 'grouped expressions with addition and multiplication',
    },
    {
      input: '2 / (5 + 5)',
      expected: '(2 / (5 + 5));',
      description: 'grouped expressions with addition and division',
    },
    {
      input: '-(5 + 5)',
      expected: '-(5 + 5);',
      description: 'grouped expressions with addition and infix operator',
    },
    {
      input: '!(true == true)',
      expected: '!(true == true);',
      description: 'grouped expressions with comparison operator and infix operator',
    },
    {
      input: 'a + add(b * c) + d',
      expected: '((a + add((b * c))) + d);',
      description: 'addition and call expression',
    },
    {
      input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)));',
      description: 'call expression with multiple expression types as args',
    },
    {
      input: 'add(a + b + c * d / f + g)',
      expected: 'add((((a + b) + ((c * d) / f)) + g));',
      description: 'call expression with multiple arithmetic operators in one arg',
    },
    {
      input: 'a * [1, 2, 3, 4][b * c] * d',
      expected: '((a * ([1, 2, 3, 4][(b * c)])) * d);',
      description: 'index operator',
    },
    {
      input: 'add(a * b[2], b[1], 2 * [1, 2][1])',
      expected: 'add((a * (b[2])), (b[1]), (2 * ([1, 2][1])));',
      description: 'multiple index operators in call arguments',
    },
  ];

  cases.forEach(({ input, description, expected }) => {
    test(`${description}: ${input}`, () => {
      const ast = parse(input);
      expect(printer(ast)).toBe(expected);
    });
  });
});

const parse = (source: string): AST.Program => {
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);
  return parser.parse();
};
