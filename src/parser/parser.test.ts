import { Lexer } from '../lexer';
import { AST, Parser, printer } from '../parser';

test('integer', () => {
  const source = '1';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [{ kind: 'EXPRESSION', expression: { kind: 'INTEGER', value: 1 } }],
  });
});

test('decimal', () => {
  const source = '1.5';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [{ kind: 'EXPRESSION', expression: { kind: 'DECIMAL', value: 1.5 } }],
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
        expression: { kind: 'STRING', value: 'Hello, world!' },
      },
    ],
  });
});

test('boolean', () => {
  const source = 'true; false;';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [
      { kind: 'EXPRESSION', expression: { kind: 'BOOLEAN', value: true } },
      { kind: 'EXPRESSION', expression: { kind: 'BOOLEAN', value: false } },
    ],
  });
});

test('nil', () => {
  const source = 'nil';

  const ast = parse(source);

  expect(ast).toEqual({
    kind: 'PROGRAM',
    statements: [{ expression: { kind: 'NIL' }, kind: 'EXPRESSION' }],
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
          function: { kind: 'IDENTIFIER', value: 'add' },
          arguments: [
            { kind: 'IDENTIFIER', value: 'one' },
            { kind: 'IDENTIFIER', value: 'two' },
          ],
        },
      },
    ],
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
            { kind: 'IDENTIFIER', value: 'x' },
            { kind: 'IDENTIFIER', value: 'y' },
          ],
          body: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: {
                  kind: 'INFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: '+' },
                  arguments: [
                    { kind: 'IDENTIFIER', value: 'x' },
                    { kind: 'IDENTIFIER', value: 'y' },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
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
            { kind: 'IDENTIFIER', value: 'x' },
            { kind: 'IDENTIFIER', value: 'y' },
          ],
          body: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: {
                  kind: 'INFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: '+' },
                  arguments: [
                    { kind: 'IDENTIFIER', value: 'x' },
                    { kind: 'IDENTIFIER', value: 'y' },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
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
          subject: { kind: 'IDENTIFIER', value: 'x' },
          cases: [
            {
              pattern: { kind: 'LIST_MATCH_PATTERN', elements: [] },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  { kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'empty' } },
                ],
              },
            },
            {
              pattern: {
                kind: 'LIST_MATCH_PATTERN',
                elements: [{ kind: 'IDENTIFIER', value: 'x' }],
              },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  { kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'one items' } },
                ],
              },
            },
            {
              pattern: {
                kind: 'LIST_MATCH_PATTERN',
                elements: [
                  { kind: 'IDENTIFIER', value: 'x' },
                  { kind: 'REST_ELEMENT', argument: { kind: 'IDENTIFIER', value: 'xs' } },
                ],
              },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  { kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'many items' } },
                ],
              },
            },
            {
              pattern: { kind: 'PLACEHOLDER' },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  { kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'unknown' } },
                ],
              },
            },
          ],
        },
      },
    ],
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
          subject: { kind: 'IDENTIFIER', value: 'x' },
          cases: [
            {
              pattern: { kind: 'INTEGER', value: 1 },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [{ kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'one' } }],
              },
            },
            {
              pattern: { kind: 'DECIMAL', value: 2 },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [{ kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'two' } }],
              },
            },
            {
              pattern: { kind: 'BOOLEAN', value: true },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  { kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'three' } },
                ],
              },
            },
            {
              pattern: { kind: 'STRING', value: 'four' },
              guard: null,
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [{ kind: 'EXPRESSION', expression: { kind: 'INTEGER', value: 4 } }],
              },
            },
          ],
        },
      },
    ],
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
          subject: { kind: 'IDENTIFIER', value: 'x' },
          cases: [
            {
              pattern: { kind: 'INTEGER', value: 1 },
              guard: {
                kind: 'INFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: '!=' },
                arguments: [
                  { kind: 'INTEGER', value: 1 },
                  { kind: 'INTEGER', value: 2 },
                ],
              },
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [{ kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'one' } }],
              },
            },
            {
              pattern: { kind: 'DECIMAL', value: 2 },
              guard: {
                kind: 'INFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: '&&' },
                arguments: [
                  { kind: 'BOOLEAN', value: true },
                  {
                    kind: 'PREFIX_EXPRESSION',
                    function: { kind: 'IDENTIFIER', value: 'unary_!' },
                    argument: { kind: 'BOOLEAN', value: false },
                  },
                ],
              },
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [{ kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'two' } }],
              },
            },
            {
              pattern: { kind: 'IDENTIFIER', value: 'e' },
              guard: {
                kind: 'INFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: '>' },
                arguments: [
                  { kind: 'IDENTIFIER', value: 'e' },
                  { kind: 'INTEGER', value: 3 },
                ],
              },
              consequence: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: { kind: 'STRING', value: 'greater than three' },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
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
          function: { kind: 'IDENTIFIER', value: '+' },
          arguments: [{ kind: 'PLACEHOLDER' }, { kind: 'INTEGER', value: 2 }],
        },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'CALL_EXPRESSION',
          function: { kind: 'IDENTIFIER', value: '+' },
          arguments: [{ kind: 'PLACEHOLDER' }, { kind: 'INTEGER', value: 2 }],
        },
      },
    ],
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
            { kind: 'IDENTIFIER', value: 'x' },
            {
              kind: 'LIST_DESTRUCTURE_PATTERN',
              elements: [
                { kind: 'IDENTIFIER', value: 'y' },
                { kind: 'REST_ELEMENT', argument: { kind: 'IDENTIFIER', value: 'z' } },
              ],
            },
            { kind: 'REST_ELEMENT', argument: { kind: 'IDENTIFIER', value: 'rest' } },
          ],
          body: {
            kind: 'BLOCK_STATEMENT',
            statements: [
              {
                kind: 'EXPRESSION',
                expression: {
                  kind: 'INFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: '+' },
                  arguments: [
                    { kind: 'IDENTIFIER', value: 'x' },
                    { kind: 'IDENTIFIER', value: 'y' },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
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
            { kind: 'INTEGER', value: 1 },
            { kind: 'DECIMAL', value: 2.5 },
            { kind: 'STRING', value: 'hello' },
          ],
        },
      },
    ],
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
              { kind: 'STRING', value: 'hello' },
              {
                kind: 'HASH_EXPRESSION',
                pairs: [
                  [
                    { kind: 'STRING', value: 'x' },
                    { kind: 'IDENTIFIER', value: 'x' },
                  ],
                ],
              },
            ],
            [
              { kind: 'INTEGER', value: 1 },
              { kind: 'STRING', value: '2' },
            ],
            [
              {
                kind: 'LIST_EXPRESSION',
                elements: [
                  { kind: 'INTEGER', value: 1 },
                  { kind: 'INTEGER', value: 2 },
                ],
              },
              { kind: 'DECIMAL', value: 1.4 },
            ],
          ],
        },
      },
    ],
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
            { kind: 'INTEGER', value: 1 },
            { kind: 'INTEGER', value: 2 },
            { kind: 'INTEGER', value: 3 },
          ],
        },
      },
    ],
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
        name: { kind: 'IDENTIFIER', value: 'x' },
        value: { kind: 'INTEGER', value: 1 },
        isMutable: false,
      },
    ],
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
        name: { kind: 'IDENTIFIER', value: 'x' },
        value: { kind: 'INTEGER', value: 1 },
        isMutable: true,
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'ASSIGNMENT',
          name: { kind: 'IDENTIFIER', value: 'x' },
          value: { kind: 'INTEGER', value: 2 },
        },
      },
    ],
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
            { kind: 'IDENTIFIER', value: 'a' },
            { kind: 'IDENTIFIER', value: 'b' },
            {
              kind: 'LIST_DESTRUCTURE_PATTERN',
              elements: [
                { kind: 'IDENTIFIER', value: 'c' },
                { kind: 'IDENTIFIER', value: 'd' },
              ],
            },
            { kind: 'REST_ELEMENT', argument: { kind: 'IDENTIFIER', value: 'e' } },
          ],
        },
        value: {
          kind: 'LIST_EXPRESSION',
          elements: [
            { kind: 'INTEGER', value: 1 },
            { kind: 'INTEGER', value: 2 },
            {
              kind: 'LIST_EXPRESSION',
              elements: [
                { kind: 'INTEGER', value: 3 },
                { kind: 'INTEGER', value: 4 },
              ],
            },
            { kind: 'INTEGER', value: 5 },
          ],
        },
        isMutable: false,
      },
    ],
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
            { kind: 'INTEGER', value: 1 },
            { kind: 'SPREAD_ELEMENT', value: { kind: 'IDENTIFIER', value: 'xs' } },
            {
              kind: 'SPREAD_ELEMENT',
              value: {
                kind: 'LIST_EXPRESSION',
                elements: [
                  { kind: 'INTEGER', value: 1 },
                  { kind: 'INTEGER', value: 2 },
                  { kind: 'INTEGER', value: 3 },
                ],
              },
            },
          ],
        },
      },
    ],
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
            function: { kind: 'IDENTIFIER', value: '<' },
            arguments: [
              { kind: 'INTEGER', value: 0 },
              { kind: 'INTEGER', value: 5 },
            ],
          },
          consequence: {
            kind: 'BLOCK_STATEMENT',
            statements: [{ kind: 'EXPRESSION', expression: { kind: 'INTEGER', value: 1 } }],
          },
          alternative: {
            kind: 'BLOCK_STATEMENT',
            statements: [{ kind: 'EXPRESSION', expression: { kind: 'INTEGER', value: 2 } }],
          },
        },
      },
    ],
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
          function: { kind: 'IDENTIFIER', value: 'add' },
          arguments: [
            { kind: 'INTEGER', value: 1 },
            { kind: 'INTEGER', value: 2 },
          ],
        },
      },
    ],
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
          start: { kind: 'INTEGER', value: 1 },
          end: { kind: 'INTEGER', value: 10 },
        },
      },
    ],
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
          start: { kind: 'INTEGER', value: 1 },
          end: { kind: 'INTEGER', value: Infinity },
        },
      },
    ],
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
          start: { kind: 'INTEGER', value: 0 },
          end: { kind: 'IDENTIFIER', value: 'x' },
        },
      },
    ],
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
        name: { kind: 'IDENTIFIER', value: 'section_one' },
        section: {
          kind: 'BLOCK_STATEMENT',
          statements: [{ kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'sample' } }],
        },
      },
      {
        kind: 'SECTION',
        name: { kind: 'IDENTIFIER', value: 'section_two' },
        section: {
          kind: 'BLOCK_STATEMENT',
          statements: [{ kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'sample' } }],
        },
      },
    ],
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
        name: { kind: 'IDENTIFIER', value: 'section_one' },
        section: {
          kind: 'BLOCK_STATEMENT',
          statements: [
            {
              kind: 'SECTION',
              name: { kind: 'IDENTIFIER', value: 'section_two' },
              section: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  { kind: 'EXPRESSION', expression: { kind: 'STRING', value: 'sample' } },
                ],
              },
            },
          ],
        },
      },
    ],
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
          function: { kind: 'IDENTIFIER', value: '-' },
          arguments: [
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '-' },
              arguments: [
                { kind: 'INTEGER', value: 4 },
                {
                  kind: 'PREFIX_EXPRESSION',
                  function: { kind: 'IDENTIFIER', value: 'unary_-' },
                  argument: { kind: 'INTEGER', value: 4 },
                },
              ],
            },
            { kind: 'INTEGER', value: 5 },
          ],
        },
      },
    ],
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
          function: { kind: 'IDENTIFIER', value: '||' },
          arguments: [
            {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_!' },
              argument: { kind: 'BOOLEAN', value: true },
            },
            {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_!' },
              argument: {
                kind: 'PREFIX_EXPRESSION',
                function: { kind: 'IDENTIFIER', value: 'unary_!' },
                argument: { kind: 'BOOLEAN', value: false },
              },
            },
          ],
        },
      },
    ],
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
            { kind: 'IDENTIFIER', value: 'inc' },
            { kind: 'IDENTIFIER', value: 'dec' },
          ],
        },
      },
    ],
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
              { kind: 'INTEGER', value: 1 },
              { kind: 'INTEGER', value: 2 },
              { kind: 'INTEGER', value: 3 },
            ],
          },
          functions: [
            {
              kind: 'CALL_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'map' },
              arguments: [
                {
                  kind: 'FUNCTION_LITERAL',
                  parameters: [{ kind: 'IDENTIFIER', value: 'x' }],
                  body: {
                    kind: 'BLOCK_STATEMENT',
                    statements: [
                      {
                        kind: 'EXPRESSION',
                        expression: {
                          kind: 'INFIX_EXPRESSION',
                          function: { kind: 'IDENTIFIER', value: '+' },
                          arguments: [
                            { kind: 'IDENTIFIER', value: 'x' },
                            { kind: 'INTEGER', value: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
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
          function: { kind: 'IDENTIFIER', value: '&&' },
          arguments: [
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '==' },
              arguments: [
                { kind: 'INTEGER', value: 1 },
                { kind: 'INTEGER', value: 1 },
              ],
            },
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '>' },
              arguments: [
                { kind: 'INTEGER', value: 1 },
                { kind: 'INTEGER', value: 2 },
              ],
            },
          ],
        },
      },
    ],
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
          function: { kind: 'IDENTIFIER', value: '||' },
          arguments: [
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '==' },
              arguments: [
                { kind: 'INTEGER', value: 1 },
                { kind: 'INTEGER', value: 1 },
              ],
            },
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '>' },
              arguments: [
                { kind: 'INTEGER', value: 1 },
                { kind: 'INTEGER', value: 2 },
              ],
            },
          ],
        },
      },
    ],
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
          initial: { kind: 'INTEGER', value: 1 },
          functions: [
            {
              kind: 'CALL_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'add' },
              arguments: [{ kind: 'INTEGER', value: 1 }],
            },
            {
              kind: 'FUNCTION_LITERAL',
              parameters: [{ kind: 'IDENTIFIER', value: 'a' }],
              body: {
                kind: 'BLOCK_STATEMENT',
                statements: [
                  {
                    kind: 'EXPRESSION',
                    expression: {
                      kind: 'INFIX_EXPRESSION',
                      function: { kind: 'IDENTIFIER', value: '+' },
                      arguments: [
                        { kind: 'IDENTIFIER', value: 'a' },
                        { kind: 'INTEGER', value: 1 },
                      ],
                    },
                  },
                ],
              },
            },
            { kind: 'IDENTIFIER', value: 'inc' },
            {
              kind: 'INFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: '+' },
              arguments: [{ kind: 'PLACEHOLDER' }, { kind: 'INTEGER', value: 1 }],
            },
          ],
        },
      },
    ],
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
          item: { kind: 'IDENTIFIER', value: 'list' },
          index: { kind: 'INTEGER', value: 1 },
        },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list' },
          index: {
            kind: 'PREFIX_EXPRESSION',
            function: { kind: 'IDENTIFIER', value: 'unary_-' },
            argument: { kind: 'INTEGER', value: 1 },
          },
        },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list' },
          index: {
            kind: 'RANGE_EXPRESSION',
            start: { kind: 'INTEGER', value: 2 },
            end: { kind: 'INTEGER', value: 5 },
          },
        },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list' },
          index: {
            kind: 'RANGE_EXPRESSION',
            start: {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_-' },
              argument: { kind: 'INTEGER', value: 2 },
            },
            end: { kind: 'INTEGER', value: Infinity },
          },
        },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list' },
          index: {
            kind: 'RANGE_EXPRESSION',
            start: { kind: 'INTEGER', value: 0 },
            end: {
              kind: 'PREFIX_EXPRESSION',
              function: { kind: 'IDENTIFIER', value: 'unary_-' },
              argument: { kind: 'INTEGER', value: 2 },
            },
          },
        },
      },
      {
        kind: 'EXPRESSION',
        expression: {
          kind: 'INDEX_EXPRESSION',
          item: { kind: 'IDENTIFIER', value: 'list' },
          index: { kind: 'STRING', value: 'key' },
        },
      },
    ],
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
