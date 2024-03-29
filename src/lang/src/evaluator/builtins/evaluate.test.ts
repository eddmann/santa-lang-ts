import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '..';

describe('evaluate', () => {
  const cases = [
    {
      source: 'evaluate("[1, 2, 3]")',
      expected: '[1, 2, 3]',
      description: 'list',
    },
    {
      source: 'evaluate("#{\\"a\\": 1, \\"b\\": 1.5}")',
      expected: '#{"a": 1, "b": 1.5}',
      description: 'dictionary',
    },
    {
      source: 'evaluate("{1, 2, 2, 1}")',
      expected: '{1, 2}',
      description: 'set',
    },
    {
      source: 'evaluate("[1, 2, 3] |> map(_ + 1)")',
      expected: '[2, 3, 4]',
      description: 'function',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

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
      expected: '"Bool"',
      description: 'boolean',
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
