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

describe('less than equal <=', () => {
  const cases = [
    {
      source: '2 <= 3',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '3 <= 3',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '2.5 <= 4.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '4.5 <= 4.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '2 <= 3.0',
      expected: 'true',
      description: 'integer-decimal',
    },
    {
      source: '1.50 <= 2',
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

describe('greater than equal >=', () => {
  const cases = [
    {
      source: '3 >= 2',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '3 >= 3',
      expected: 'true',
      description: 'integer',
    },
    {
      source: '4.5 >= 2.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '4.5 >= 4.5',
      expected: 'true',
      description: 'decimal',
    },
    {
      source: '3 >= 2.0',
      expected: 'true',
      description: 'integer-decimal',
    },
    {
      source: '2.5 >= 1',
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
    {
      source: '!nil',
      expected: 'true',
      description: 'nil',
    },
    {
      source: '!""',
      expected: 'true',
      description: 'empty string',
    },
    {
      source: '![]',
      expected: 'true',
      description: 'empty list',
    },
    {
      source: '!{}',
      expected: 'true',
      description: 'empty set',
    },
    {
      source: 'let fn = || false; !fn()',
      expected: 'true',
      description: 'function invocation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('combinations', () => {
  const cases = [
    {
      source: 'combinations(1, [])',
      expected: '[]',
      description: 'empty list',
    },
    {
      source: 'combinations(1, [1, 2, 3, 4, 5])',
      expected: '[[1], [2], [3], [4], [5]]',
      description: 'one element',
    },
    {
      source: 'combinations(2, [1, 2, 3, 4, 5])',
      expected: '[[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5], [3, 4], [3, 5], [4, 5]]',
      description: 'two elements',
    },
    {
      source: 'combinations(5, [1, 2, 3, 4, 5])',
      expected: '[[1, 2, 3, 4, 5]]',
      description: 'one combination',
    },
    {
      source: 'combinations(6, [1, 2, 3, 4, 5])',
      expected: '[]',
      description: 'exhausted elements',
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
