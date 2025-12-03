import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '../../evaluator';

describe('addition +', () => {
  const cases = [
    {
      source: '1 + 1',
      expected: '2',
      description: 'integer',
    },
    {
      source: '1.25 + 1.25',
      expected: '2.5',
      description: 'decimal',
    },
    {
      source: '1 + 1.25',
      expected: '2',
      description: 'integer-decimal',
    },
    {
      source: '1.25 + 1',
      expected: '2.25',
      description: 'decimal-integer',
    },
    {
      source: '[1, 2, 3] + [4, 5, 6]',
      expected: '[1, 2, 3, 4, 5, 6]',
      description: 'list',
    },
    {
      source: '#{1: 2} + #{"hello": "world"}',
      expected: '#{1: 2, "hello": "world"}',
      description: 'dictionary',
    },
    {
      source: '{1, 2, 3} + {1, 4, 5}',
      expected: '{1, 2, 3, 4, 5}',
      description: 'set',
    },
    {
      source: '"a" + 1',
      expected: '"a1"',
      description: 'string-integer',
    },
    {
      source: '"a" + 1.5',
      expected: '"a1.5"',
      description: 'string-decimal',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('subtraction -', () => {
  const cases = [
    {
      source: '2 - 1',
      expected: '1',
      description: 'integer',
    },
    {
      source: '1.50 - 1.25',
      expected: '0.25',
      description: 'decimal',
    },
    {
      source: '3 - 1.25',
      expected: '1',
      description: 'integer-decimal',
    },
    {
      source: '1.25 - 1',
      expected: '0.25',
      description: 'decimal-integer',
    },
    {
      source: '{1, 2, 3} - {1, 2}',
      expected: '{3}',
      description: 'set',
    },
    {
      source: '[1, [1, 2], 3] - [[1, 2]]',
      expected: '[1, 3]',
      description: 'list',
    },
    {
      source: '#{"hello": "world", 1: 2, [1, 2]: 1.5} - {1, "hello"}',
      expected: '#{[1, 2]: 1.5}',
      description: 'dictionary-set',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('multiply *', () => {
  const cases = [
    {
      source: '2 * 2',
      expected: '4',
      description: 'integer',
    },
    {
      source: '1.30 * 1.20',
      expected: '1.56',
      description: 'decimal',
    },
    {
      source: '3 * 1.25',
      expected: '3',
      description: 'integer-decimal',
    },
    {
      source: '1.25 * 2',
      expected: '2.5',
      description: 'decimal-integer',
    },
    {
      source: '[1] * 3',
      expected: '[1, 1, 1]',
      description: 'list-integer',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('divide /', () => {
  const cases = [
    {
      source: '3 / 2',
      expected: '1',
      description: 'integer',
    },
    {
      source: '4.5 / 2.5',
      expected: '1.8',
      description: 'decimal',
    },
    {
      source: '3 / 2.0',
      expected: '1',
      description: 'integer-decimal',
    },
    {
      source: '1.50 / 2',
      expected: '0.75',
      description: 'decimal-integer',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('modulo %', () => {
  const cases = [
    {
      source: '11 % 3',
      expected: '2',
      description: 'integer',
    },
    {
      source: '10.25 % 3.5',
      expected: '3.25',
      description: 'decimal',
    },
    {
      source: '3 % 2.0',
      expected: '1',
      description: 'integer-decimal',
    },
    {
      source: '2.50 % 2',
      expected: '0.5',
      description: 'decimal-integer',
    },
    {
      source: '-4 % 3',
      expected: '2',
      description: 'negative',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('negative -x', () => {
  const cases = [
    {
      source: '-1',
      expected: '-1',
      description: 'integer',
    },
    {
      source: '-1.5',
      expected: '-1.5',
      description: 'decimal',
    },
    {
      source: '--1',
      expected: '1',
      description: 'double integer negation',
    },
    {
      source: '--1.5',
      expected: '1.5',
      description: 'double decimal negation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('abs', () => {
  const cases = [
    {
      source: 'abs(-1)',
      expected: '1',
      description: 'negative integer',
    },
    {
      source: 'abs(-1.5)',
      expected: '1.5',
      description: 'negative decimal',
    },
    {
      source: 'abs(1)',
      expected: '1',
      description: 'positive integer',
    },
    {
      source: 'abs(1.5)',
      expected: '1.5',
      description: 'positive decimal',
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
