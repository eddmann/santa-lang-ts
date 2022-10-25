import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '../../evaluator';

describe('json_encode', () => {
  const cases = [
    {
      source: 'json_encode(#{"hello": 1, 1: [1.5, true], 1.4: {1, 2, 3}})',
      expected: '"{""hello"": 1, "1": [1.5, true], "1.4": [1, 2, 3]}"',
      description: '',
    },
    {
      source: 'json_encode([1, "2", true, 1.5])',
      expected: '"[1, "2", true, 1.5]"',
      description: '',
    },
    {
      source: 'json_encode("Hello, world!")',
      expected: '""Hello, world!""',
      description: '',
    },
    {
      source: 'json_encode(1)',
      expected: '"1"',
      description: '',
    },
    {
      source: 'json_encode(true)',
      expected: '"true"',
      description: '',
    },
    {
      source: 'json_encode(1.5)',
      expected: '"1.5"',
      description: '',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('json_decode', () => {
  const cases = [
    {
      source: 'json_decode("{\\"hello\\": 1, \\"1\\": [1.5, true], \\"1.4\\": [1, 2, 3]}")',
      expected: '#{"1": [1.5, true], "hello": 1, "1.4": [1, 2, 3]}',
      description: '',
    },
    {
      source: 'json_decode("[1, \\"2\\", true, 1.5]")',
      expected: '[1, "2", true, 1.5]',
      description: '',
    },
    {
      source: 'json_decode("\\"Hello, world!\\"")',
      expected: '"Hello, world!"',
      description: '',
    },
    {
      source: 'json_decode("1")',
      expected: '1',
      description: '',
    },
    {
      source: 'json_decode("true")',
      expected: 'true',
      description: '',
    },
    {
      source: 'json_decode("1.5")',
      expected: '1.5',
      description: '',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

const doEvaluate = (source: string): string => {
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);
  return evaluate(parser.parse(), new O.Environment()).inspect();
};
