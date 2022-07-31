import { Lexer } from '../../lexer';
import { Parser } from '../../parser';
import { evaluate, O } from '../../evaluator';

describe('map', () => {
  const cases = [
    {
      source: 'map(_ + 1, [1, 2, 3])',
      expected: '[2, 3, 4]',
      description: 'list',
    },
    {
      source: 'map(_ + 1, #{"a": 1, "b": 2, "c": 3})',
      expected: '#{"a": 2, "b": 3, "c": 4}',
      description: 'hash',
    },
    {
      source: 'map(_ + 1, {1, 2, 3})',
      expected: '{2, 3, 4}',
      description: 'set',
    },
    {
      source: 'map(_ + "!", "hello")',
      expected: '["h!", "e!", "l!", "l!", "o!"]',
      description: 'string',
    },
    {
      source: 'map(_ + 1, 1..5)',
      expected: '[2, 3, 4, 5, 6]',
      description: 'bounded range',
    },
    {
      source: 'map(_ + 1, 1..)',
      expected: '[2, 3, 4, ..∞]',
      description: 'unbounded range',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('filter', () => {
  const cases = [
    {
      source: 'filter(_ != 1, [1, 2, 3])',
      expected: '[2, 3]',
      description: 'list',
    },
    {
      source: 'filter(_ != 1, #{"a": 1, "b": 2, "c": 3})',
      expected: '#{"b": 2, "c": 3}',
      description: 'hash (using value)',
    },
    {
      source: 'filter(|_, k| k != "a", #{"a": 1, "b": 2, "c": 3})',
      expected: '#{"b": 2, "c": 3}',
      description: 'hash (using key)',
    },
    {
      source: 'filter(_ != 1, {1, 2, 3})',
      expected: '{2, 3}',
      description: 'set',
    },
    {
      source: 'filter(_ != "l", "hello")',
      expected: '["h", "e", "o"]',
      description: 'string',
    },
    {
      source: 'filter(_ != 2, 1..5)',
      expected: '[1, 3, 4, 5]',
      description: 'bounded range',
    },
    {
      source: 'filter(|v| v % 2 == 0, 1..)',
      expected: '[2, 4, 6, ..∞]',
      description: 'unbounded range',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('reduce', () => {
  const cases = [
    {
      source: 'reduce(+, 0, [1, 2, 3])',
      expected: '6',
      description: 'list',
    },
    {
      source: 'reduce(+, 0, #{"a": 1, "b": 2, "c": 3})',
      expected: '6',
      description: 'hash (using value)',
    },
    {
      source: `
          reduce(
            |acc, v, k| if k == "a" { v } else { acc },
            -1,
            #{"a": 1, "b": 2, "c": 3}
          )
        `,
      expected: '1',
      description: 'hash (using key)',
    },
    {
      source: 'reduce(+, 0, {1, 2, 3})',
      expected: '6',
      description: 'set',
    },
    {
      source: 'reduce(|acc, v| v + acc, "", "hello")',
      expected: '"olleh"',
      description: 'string',
    },
    {
      source: `
          reduce(
            |acc, v, k| if k == "a" { break v } else { acc },
            false,
            #{"a": 1, "b": 2, "c": 3}
          )
        `,
      expected: '1',
      description: 'break short-circuit',
    },
    {
      source: 'reduce(+, 0, 1..5)',
      expected: '15',
      description: 'bounded range',
    },
    {
      source: 'reduce(+, 0, 1..)',
      expected: 'Runtime error: Unable to reduce an infinite range',
      description: 'unbounded range',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('reduce_s', () => {
  const cases = [
    {
      source: 'reduce_s(|[acc, prev], val| [acc + prev * val, val], [0, 0], 1..10)',
      expected: '330',
      description: 'single state',
    },
    {
      source: 'reduce_s(|[acc, x, y], val| [acc + x * y * val, val, val / 2], [0, 0, 0], 1..10)',
      expected: '1060',
      description: 'multi-state',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('each', () => {
  const cases = [
    {
      source: `
        let mut acc = 0;
        each(|v| acc = acc + v, [1, 2, 3])
        acc
      `,
      expected: '6',
      description: 'list',
    },
    {
      source: `
        let mut acc = 0;
        each(|v| acc = acc + v, #{"a": 1, "b": 2, "c": 3})
        acc
      `,
      expected: '6',
      description: 'hash (using value)',
    },
    {
      source: `
        let mut acc = "";
        each(|_, k| acc = acc + k, #{"a": 1, "b": 2, "c": 3})
        acc
      `,
      expected: '"abc"',
      description: 'hash (using key)',
    },
    {
      source: `
        let mut acc = 0;
        each(|v| acc = acc + v, {1, 2, 3})
        acc
      `,
      expected: '6',
      description: 'set',
    },
    {
      source: `
        let mut acc = "";
        each(|v| acc = v + acc, "hello")
        acc
      `,
      expected: '"olleh"',
      description: 'string',
    },
    {
      source: `
        let mut acc = 0;
        each(
          |v, k| {
            if k == "b" {
              break;
            }
            acc = v;
          },
          #{"a": 1, "b": 2, "c": 3}
        )
        acc
      `,
      expected: '1',
      description: 'break short-circuit',
    },
    {
      source: `
        let mut acc = 0;
        each(|v| acc = acc + v, 1..5)
        acc
      `,
      expected: '15',
      description: 'bounded range',
    },
    {
      source: `
        let mut acc = 0;
        each(
          |v| {
            if v == 6 {
              break;
            }
            acc = acc + v;
          },
          1..
        )
        acc
      `,
      expected: '15',
      description: 'unbounded range',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('flat_map', () => {
  const cases = [
    {
      source: 'flat_map(_ + 1, [])',
      expected: '[]',
      description: 'empty list',
    },
    {
      source: 'flat_map(|v| [v] * 2, [1, 2, 3])',
      expected: '[1, 1, 2, 2, 3, 3]',
      description: 'mapped list elements',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('find', () => {
  const cases = [
    {
      source: 'find(_ != 1, [1, 2, 3])',
      expected: '2',
      description: 'list',
    },
    {
      source: 'find(_ != 1, #{"a": 1, "b": 2, "c": 3})',
      expected: '2',
      description: 'hash (using value)',
    },
    {
      source: 'find(|_, k| k != "a", #{"a": 1, "b": 2, "c": 3})',
      expected: '2',
      description: 'hash (using key)',
    },
    {
      source: 'find(_ != 1, {1, 2, 3})',
      expected: '2',
      description: 'set',
    },
    {
      source: 'find(_ != "h", "hello")',
      expected: '"e"',
      description: 'string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('min', () => {
  const cases = [
    {
      source: 'min([3, 2, 1])',
      expected: '1',
      description: 'list of integers',
    },
    {
      source: 'min([3.2, 1.1, 2.8])',
      expected: '1.1',
      description: 'list of decimals',
    },
    {
      source: 'min(["b", "a", "c"])',
      expected: '"a"',
      description: 'list of strings',
    },
    {
      source: 'min({3, 2, 1})',
      expected: '1',
      description: 'set of integers',
    },
    {
      source: 'min({3.2, 1.1, 2.8})',
      expected: '1.1',
      description: 'set of decimals',
    },
    {
      source: 'min({"b", "a", "c"})',
      expected: '"a"',
      description: 'set of strings',
    },
    {
      source: 'min(#{"a": 3, "b": 2, "c": 1})',
      expected: '1',
      description: 'hash of integer values',
    },
    {
      source: 'min(#{"a": 3.2, "b": 1.1, "c": 2.8})',
      expected: '1.1',
      description: 'hash of decimal values',
    },
    {
      source: 'min(#{"b": "b", "a": "a", "c": "c"})',
      expected: '"a"',
      description: 'hash of string values',
    },
    {
      source: 'min(1..10)',
      expected: '1',
      description: 'range',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('max', () => {
  const cases = [
    {
      source: 'max([3, 2, 1])',
      expected: '3',
      description: 'list of integers',
    },
    {
      source: 'max([3.2, 1.1, 2.8])',
      expected: '3.2',
      description: 'list of decimals',
    },
    {
      source: 'max(["b", "a", "c"])',
      expected: '"c"',
      description: 'list of strings',
    },
    {
      source: 'max({3, 2, 1})',
      expected: '3',
      description: 'set of integers',
    },
    {
      source: 'max({3.2, 1.1, 2.8})',
      expected: '3.2',
      description: 'set of decimals',
    },
    {
      source: 'max({"b", "a", "c"})',
      expected: '"c"',
      description: 'set of strings',
    },
    {
      source: 'max(#{"a": 3, "b": 2, "c": 1})',
      expected: '3',
      description: 'hash of integer values',
    },
    {
      source: 'max(#{"a": 3.2, "b": 1.1, "c": 2.8})',
      expected: '3.2',
      description: 'hash of decimal values',
    },
    {
      source: 'max(#{"b": "b", "a": "a", "c": "c"})',
      expected: '"c"',
      description: 'hash of string values',
    },
    {
      source: 'max(1..10)',
      expected: '10',
      description: 'range',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('contains', () => {
  const cases = [
    {
      source: '[1, 2, 3] `contains` 1',
      expected: 'true',
      description: 'list',
    },
    {
      source: '#{"a": 1, "b": 2, "c": 3} `contains` 1',
      expected: 'true',
      description: 'hash (using value)',
    },
    {
      source: '{1, 2, 3} `contains` 1',
      expected: 'true',
      description: 'set',
    },
    {
      source: '"hello" `contains` "h"',
      expected: 'true',
      description: 'string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('sort', () => {
  const cases = [
    {
      source: 'sort(>, [3, 1, 2])',
      expected: '[1, 2, 3]',
      description: 'integers in ascending order',
    },
    {
      source: 'sort(<, [3, 1, 2])',
      expected: '[3, 2, 1]',
      description: 'integers in descending order',
    },
    {
      source: 'sort(>, [3.2, 3.1, 3.2, 2.8])',
      expected: '[2.8, 3.1, 3.2, 3.2]',
      description: 'decimals in ascending order',
    },
    {
      source: 'sort(<, [3.2, 3.1, 3.2, 2.8])',
      expected: '[3.2, 3.2, 3.1, 2.8]',
      description: 'decimals in descending order',
    },
    {
      source: 'sort(>, ["b", "a", "c"])',
      expected: '["a", "b", "c"]',
      description: 'strings in ascending order',
    },
    {
      source: 'sort(<, ["b", "a", "c"])',
      expected: '["c", "b", "a"]',
      description: 'strings in descending order',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('size', () => {
  const cases = [
    {
      source: 'size([1, 2, 3])',
      expected: '3',
      description: 'list',
    },
    {
      source: 'size(#{"a": 1, "b": 2, "c": 3})',
      expected: '3',
      description: 'hash (using value)',
    },
    {
      source: 'size({1, 2, 3})',
      expected: '3',
      description: 'set',
    },
    {
      source: 'size("hello")',
      expected: '5',
      description: 'string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('take', () => {
  const cases = [
    {
      source: 'take(2, [1, 2, 3])',
      expected: '[1, 2]',
      description: 'list',
    },
    {
      source: 'take(2, 1..)',
      expected: '[1, 2]',
      description: 'range',
    },
    {
      source: 'take(2, "hello")',
      expected: '"he"',
      description: 'string',
    },
    {
      source: '1.. |> filter(|v| v % 2 == 0) |> take(2)',
      expected: '[2, 4]',
      description: 'collection transformation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('skip', () => {
  const cases = [
    {
      source: 'skip(2, [1, 2, 3])',
      expected: '[3]',
      description: 'list',
    },
    {
      source: 'skip(2, 1..)',
      expected: '[3, 4, 5, ..∞]',
      description: 'range',
    },
    {
      source: 'skip(2, "hello")',
      expected: '"llo"',
      description: 'string',
    },
    {
      source: '1.. |> filter(|v| v % 2 == 0) |> skip(2)',
      expected: '[6, 8, 10, ..∞]',
      description: 'collection transformation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('first', () => {
  const cases = [
    {
      source: 'first([1, 2, 3])',
      expected: '1',
      description: 'list',
    },
    {
      source: 'first(1..)',
      expected: '1',
      description: 'range',
    },
    {
      source: 'first("hello")',
      expected: '"h"',
      description: 'string',
    },
    {
      source: '1.. |> filter(|v| v % 2 == 0) |> skip(2) |> first',
      expected: '6',
      description: 'collection transformation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('last', () => {
  const cases = [
    {
      source: 'last([1, 2, 3])',
      expected: '3',
      description: 'list',
    },
    {
      source: 'last(1..)',
      expected: 'Runtime error: Unable to find last item within an infinite range',
      description: 'range',
    },
    {
      source: 'last("hello")',
      expected: '"o"',
      description: 'string',
    },
    {
      source: '1.. |> filter(|v| v % 2 == 0) |> take(10) |> last',
      expected: '20',
      description: 'collection transformation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('rest', () => {
  const cases = [
    {
      source: 'rest([1, 2, 3])',
      expected: '[2, 3]',
      description: 'list',
    },
    {
      source: 'rest(1..)',
      expected: '[2, 3, 4, ..∞]',
      description: 'range',
    },
    {
      source: 'rest("hello")',
      expected: '"ello"',
      description: 'string',
    },
    {
      source: '1.. |> filter(|v| v % 2 == 0) |> skip(2) |> rest',
      expected: '[8, 10, 12, ..∞]',
      description: 'collection transformation',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('chunk', () => {
  const cases = [
    {
      source: 'chunk(2, [1, 2, 3])',
      expected: '[[1, 2], [3]]',
      description: 'list with odd amount of times',
    },
    {
      source: 'chunk(2, [1, 2, 3, 4])',
      expected: '[[1, 2], [3, 4]]',
      description: 'list with even amount of times',
    },
    {
      source: 'chunk(5, [1, 2, 3, 4])',
      expected: '[[1, 2, 3, 4]]',
      description: 'list with less items than the chunk',
    },
    {
      source: 'chunk(2, "hello")',
      expected: '[["h", "e"], ["l", "l"], ["o"]]',
      description: 'string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('keys', () => {
  const cases = [
    {
      source: 'keys(#{"a": 1, "b": 2, "c": 3})',
      expected: '["a", "b", "c"]',
      description: 'keys of hash',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('values', () => {
  const cases = [
    {
      source: 'values(#{"a": 1, "b": 2, "c": 3})',
      expected: '[1, 2, 3]',
      description: 'values of hash',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('zip', () => {
  const cases = [
    {
      source: 'zip([1, 2, 3], [4, 5, 6])',
      expected: '[[1, 4], [2, 5], [3, 6]]',
      description: 'list-list',
    },
    {
      source: 'zip("hello", "world")',
      expected: '[["h", "w"], ["e", "o"], ["l", "r"], ["l", "l"], ["o", "d"]]',
      description: 'string-string',
    },
    {
      source: 'zip(["a", "b", "c"], 1..)',
      expected: '[["a", 1], ["b", 2], ["c", 3]]',
      description: 'list-range',
    },
    {
      source: 'zip(1.., ["a", "b", "c"])',
      expected: '[[1, "a"], [2, "b"], [3, "c"]]',
      description: 'range-list',
    },
    {
      source: 'zip("hello", 1..)',
      expected: '[["h", 1], ["e", 2], ["l", 3], ["l", 4], ["o", 5]]',
      description: 'string-range',
    },
    {
      source: 'zip(1.., "world")',
      expected: '[[1, "w"], [2, "o"], [3, "r"], [4, "l"], [5, "d"]]',
      description: 'range-string',
    },
    {
      source: 'zip(1.., 2..)',
      expected: '[[1, 2], [2, 3], [3, 4], ..∞]',
      description: 'range-range',
    },
    {
      source: 'zip([1, 2, 3], 4.., "hello")',
      expected: '[[1, 4, "h"], [2, 5, "e"], [3, 6, "l"]]',
      description: 'list-range-string',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('hash', () => {
  const cases = [
    {
      source: 'hash([])',
      expected: '#{}',
      description: 'empty list',
    },
    {
      source: 'hash([[1, "one"], [2, "two"], [3, "three"]])',
      expected: '#{1: "one", 2: "two", 3: "three"}',
      description: 'list with key-value pairs',
    },
    {
      source: 'hash([1, 2, 3])',
      expected:
        'Runtime error: The List is expected to be of the form [[K, V], ..] to convert to a Hash',
      description: 'list without pairs',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('cycle', () => {
  const cases = [
    {
      source: 'cycle([])',
      expected: '[]',
      description: 'empty list',
    },
    {
      source: 'cycle([1, 2, 3])',
      expected: '[1, 2, 3, ..∞]',
      description: 'list cycle',
    },
    {
      source: 'take(5, cycle([1, 2, 3]))',
      expected: '[1, 2, 3, 1, 2]',
      description: 'take from cycle',
    },
    {
      source: 'take(5, cycle([1, 2, 3]))[4]',
      expected: '2',
      description: 'nth from cycle',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('assoc', () => {
  const cases = [
    {
      source: 'assoc(0, 1, [])',
      expected: '[1]',
      description: 'empty list',
    },
    {
      source: 'assoc(1, 2, [])',
      expected: '[nil, 2]',
      description: 'empty list, specifying second index',
    },
    {
      source: 'assoc(1, 10, [1, 2, 3])',
      expected: '[1, 10, 3]',
      description: 'list with existing value',
    },
    {
      source: 'assoc(1, 10, #{})',
      expected: '#{1: 10}',
      description: 'empty hash',
    },
    {
      source: 'assoc(1, 10, #{1: 20})',
      expected: '#{1: 10}',
      description: 'hash with existing value',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('update', () => {
  const cases = [
    {
      source: 'update(0, || 4, [])',
      expected: '[4]',
      description: 'empty list',
    },
    {
      source: 'update(1, || 2, [])',
      expected: '[nil, 2]',
      description: 'empty list, specifying second index',
    },
    {
      source: 'update(1, _ * 2, [1, 2, 3])',
      expected: '[1, 4, 3]',
      description: 'list with existing value',
    },
    {
      source: 'update(1, || 10, #{})',
      expected: '#{1: 10}',
      description: 'empty hash',
    },
    {
      source: 'update(1, _ - 10, #{1: 20})',
      expected: '#{1: 10}',
      description: 'hash with existing value',
    },
  ];

  cases.forEach(({ source, expected, description }) => {
    test(`${description}: ${source}`, () => {
      expect(doEvaluate(source)).toEqual(expected);
    });
  });
});

describe('get', () => {
  const cases = [
    {
      source: 'get(0, [])',
      expected: 'nil',
      description: 'empty list',
    },
    {
      source: 'get(1, [1, 2, 3])',
      expected: '2',
      description: 'list with values',
    },
    {
      source: 'get(1, #{})',
      expected: 'nil',
      description: 'empty hash',
    },
    {
      source: 'get(1, #{1: 20})',
      expected: '20',
      description: 'hash with values',
    },
    {
      source: 'get(1, {})',
      expected: 'nil',
      description: 'empty set',
    },
    {
      source: 'get(1, {1})',
      expected: '1',
      description: 'set with values',
    },
    {
      source: 'get(11, 1..10)',
      expected: 'nil',
      description: 'range out-of-bounds',
    },
    {
      source: 'get(1, 1..10)',
      expected: '2',
      description: 'range within bounds',
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
