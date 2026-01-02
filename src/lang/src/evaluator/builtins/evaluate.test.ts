import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '..';

describe('type', () => {
  const cases = [
    {
      source: 'type([1, 2, 3])',
      expected: '"List"',
      description: 'list',
    },
    {
      source: 'type(#{})',
      expected: '"Dictionary"',
      description: 'dictionary',
    },
    {
      source: 'type(1)',
      expected: '"Integer"',
      description: 'integer',
    },
    {
      source: 'type(true)',
      expected: '"Boolean"',
      description: 'boolean',
    },
    {
      source: 'type("hello")',
      expected: '"String"',
      description: 'string',
    },
    {
      source: 'type(1..5)',
      expected: '"BoundedRange"',
      description: 'bounded range',
    },
    {
      source: 'type(1..)',
      expected: '"UnboundedRange"',
      description: 'unbounded range',
    },
    {
      source: 'type(1.. |> map(_ + 1))',
      expected: '"LazySequence"',
      description: 'lazy sequence',
    },
    {
      source: 'type(|x| x)',
      expected: '"Function"',
      description: 'function',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

test(`memoize`, () => {
  const source = `
    let fibonacci = memoize |n| if (n > 1) { fibonacci(n - 1) + fibonacci(n - 2) } else { n };
    fibonacci(50)
  `;

  expect(doEvaluate(source)).toEqual('12586269025');
});

const doEvaluate = (source: string): string => {
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);
  return evaluate(parser.parse(), new O.Environment()).inspect();
};
