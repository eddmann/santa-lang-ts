import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '../../evaluator';

describe('less than <', () => {
  const cases = [
    {
      source: '2 < 3',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '2.5 < 4.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '2 < 3.0',
      expected: 'true',
      description: 'integer-decimal',
    },
    {
      source: '1.50 < 2',
      expected: 'true',
      description: 'decimal-integer',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('greater than >', () => {
  const cases = [
    {
      source: '3 > 2',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '4.5 > 2.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '3 > 2.0',
      expected: 'true',
      description: 'integer-decimal',
    },
    {
      source: '2.5 > 1',
      expected: 'true',
      description: 'decimal-integer',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('equality ==', () => {
  const cases = [
    {
      source: '1 == 1',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '2.5 == 2.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '2 == 2.0',
      expected: 'false',
      description: 'integer-decimal',
    },
    {
      source: '2.0 == 2',
      expected: 'false',
      description: 'decimal-integer',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('negated equality !=', () => {
  const cases = [
    {
      source: '2 != 1',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '3.0 != 2.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '3 != 2.0',
      expected: 'true',
      description: 'integer-decimal',
    },
    {
      source: '2.5 != 2',
      expected: 'true',
      description: 'decimal-integer',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('logical and &&', () => {
  const cases = [
    {
      source: '1 == 1 && 2 == 2',
      expected: 'true',
      description: 'true comparison',
    },
    {
      source: 'true && true',
      expected: 'true',
      description: 'true boolean',
    },
    {
      source: '1 == 1 && false',
      expected: 'false',
      description: 'false',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('logical or ||', () => {
  const cases = [
    {
      source: '1 == 1 || 2 == 2',
      expected: 'true',
      description: 'true comparison',
    },
    {
      source: 'true || true',
      expected: 'true',
      description: 'true boolean',
    },
    {
      source: '1 == 1 || false',
      expected: 'true',
      description: 'true left-side',
    },
    {
      source: 'false || 1 == 1',
      expected: 'true',
      description: 'true right-side',
    },
    {
      source: '1 != 1 || 2 != 2',
      expected: 'false',
      description: 'false',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('negation !', () => {
  const cases = [
    {
      source: '!true',
      expected: 'false',
      description: 'true',
    },
    {
      source: '!false',
      expected: 'true',
      description: 'false',
    },
    {
      source: '!(1 == 1)',
      expected: 'false',
      description: 'boolean expression',
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
