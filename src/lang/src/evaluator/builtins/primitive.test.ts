import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '../../evaluator';

describe('bool', () => {
  const cases = [
    {
      source: 'bool(true)',
      expected: 'true',
      description: 'true boolean',
    },
    {
      source: 'bool(false)',
      expected: 'false',
      description: 'false boolean',
    },
    {
      source: 'bool(0)',
      expected: 'false',
      description: '',
    },
    {
      source: 'bool(1)',
      expected: 'true',
      description: '',
    },
    {
      source: 'bool(0.0)',
      expected: 'false',
      description: '',
    },
    {
      source: 'bool(1.5)',
      expected: 'true',
      description: '',
    },
    {
      source: 'bool("")',
      expected: 'false',
      description: '',
    },
    {
      source: 'bool("hello")',
      expected: 'true',
      description: '',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('int', () => {
  const cases = [
    {
      source: 'int(true)',
      expected: '1',
      description: 'true boolean',
    },
    {
      source: 'int(false)',
      expected: '0',
      description: 'false boolean',
    },
    {
      source: 'int(-1)',
      expected: '-1',
      description: 'negative integer',
    },
    {
      source: 'int(1)',
      expected: '1',
      description: 'positive integer',
    },
    {
      source: 'int(-1.5)',
      expected: '-2',
      description: 'negative decimal',
    },
    {
      source: 'int(1.5)',
      expected: '1',
      description: 'positive decimal',
    },
    {
      source: 'int("")',
      expected: '0',
      description: 'empty string',
    },
    {
      source: 'int("-1")',
      expected: '-1',
      description: 'negative integer string',
    },
    {
      source: 'int("1")',
      expected: '1',
      description: 'positive integer string',
    },
    {
      source: 'int("-1.5")',
      expected: '-1',
      description: 'negative decimal string',
    },
    {
      source: 'int("1.5")',
      expected: '1',
      description: 'positive decimal string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('dec', () => {
  const cases = [
    {
      source: 'dec(true)',
      expected: '1',
      description: 'true boolean',
    },
    {
      source: 'dec(false)',
      expected: '0',
      description: 'false boolean',
    },
    {
      source: 'dec(-1)',
      expected: '-1',
      description: 'negative integer',
    },
    {
      source: 'dec(1)',
      expected: '1',
      description: 'positive integer',
    },
    {
      source: 'dec(-1.5)',
      expected: '-1.5',
      description: 'negative decimal',
    },
    {
      source: 'dec(1.5)',
      expected: '1.5',
      description: 'positive decimal',
    },
    {
      source: 'dec("")',
      expected: '0',
      description: 'empty string',
    },
    {
      source: 'dec("-1")',
      expected: '-1',
      description: 'negative integer string',
    },
    {
      source: 'dec("1")',
      expected: '1',
      description: 'positive integer string',
    },
    {
      source: 'dec("-1.5")',
      expected: '-1.5',
      description: 'negative decimal string',
    },
    {
      source: 'dec("1.5")',
      expected: '1.5',
      description: 'positive decimal string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('str', () => {
  const cases = [
    {
      source: 'str(true)',
      expected: '"true"',
      description: 'true boolean',
    },
    {
      source: 'str(false)',
      expected: '"false"',
      description: 'false boolean',
    },
    {
      source: 'str(-1)',
      expected: '"-1"',
      description: 'negative integer',
    },
    {
      source: 'str(1)',
      expected: '"1"',
      description: 'positive integer',
    },
    {
      source: 'str(-1.5)',
      expected: '"-1.5"',
      description: 'negative decimal',
    },
    {
      source: 'str(1.5)',
      expected: '"1.5"',
      description: 'positive decimal',
    },
    {
      source: 'str("")',
      expected: '""',
      description: 'empty string',
    },
    {
      source: 'str("hello")',
      expected: '"hello"',
      description: 'string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('split', () => {
  const cases = [
    {
      source: 'split("-", "1-2-3")',
      expected: '["1", "2", "3"]',
      description: 'delimiter',
    },
    {
      source: 'split("", "1-2-3")',
      expected: '["1", "-", "2", "-", "3"]',
      description: 'empty',
    },
    {
      source: 'split("\\n", "1\\n2\\n3")',
      expected: '["1", "2", "3"]',
      description: 'empty',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('lines', () => {
  const cases = [
    {
      source: 'lines("123")',
      expected: '["123"]',
      description: 'lines present',
    },
    {
      source: 'lines("1\\n2\\n3")',
      expected: '["1", "2", "3"]',
      description: 'no lines present',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('regex_match', () => {
  const cases = [
    {
      source: 'regex_match("([0-9]), ([0-9]{2}), ([0-9]+)", "1, 22, 333")',
      expected: '["1", "22", "333"]',
      description: 'match present',
    },
    {
      source: 'regex_match("([0-9]), ([0-9]{2}), ([0-9]+)", "1, 22")',
      expected: '[]',
      description: 'no match present',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('regex_match_all', () => {
  const cases = [
    {
      source: 'regex_match_all("([0-9]+)", "1, 22, 333")',
      expected: '["1", "22", "333"]',
      description: 'match present',
    },
    {
      source: 'regex_match_all("([0-9]+)", "abc")',
      expected: '[]',
      description: 'no match present',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('ints', () => {
  const cases = [
    {
      source: 'ints("1, -22, 333")',
      expected: '[1, -22, 333]',
      description: 'match present',
    },
    {
      source: 'ints("abc")',
      expected: '[]',
      description: 'no match present',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('upper', () => {
  const cases = [
    {
      source: 'upper("abcd")',
      expected: '"ABCD"',
      description: 'lower-case string',
    },
    {
      source: 'upper("ABCD")',
      expected: '"ABCD"',
      description: 'upper-case string',
    },
    {
      source: 'upper("AbCd")',
      expected: '"ABCD"',
      description: 'upper and lower-case string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('lower', () => {
  const cases = [
    {
      source: 'lower("abcd")',
      expected: '"abcd"',
      description: 'lower-case string',
    },
    {
      source: 'lower("ABCD")',
      expected: '"abcd"',
      description: 'upper-case string',
    },
    {
      source: 'lower("AbCd")',
      expected: '"abcd"',
      description: 'upper and lower-case string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('replace', () => {
  const cases = [
    {
      source: 'replace("a", "b", "aBaD")',
      expected: '"bBbD"',
      description: 'single matching char',
    },
    {
      source: 'replace("ab", "CD", "DabEab")',
      expected: '"DCDECD"',
      description: 'multiple match char',
    },
    {
      source: 'replace("a", "b", "cdef")',
      expected: '"cdef"',
      description: 'no match char',
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
