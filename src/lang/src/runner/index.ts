import { Lexer } from '../lexer';
import { AST, Parser } from '../parser';
import { O, evaluate } from '../evaluator';

const evaluateSection = (
  section: O.Section,
  environment: O.Enviornment,
  input: O.Obj | null = null
): O.Obj => {
  const sectionEnvironment = new O.Environment(environment);

  if (input) {
    sectionEnvironment.declareVariable('input', input, false);
  }

  const result = evaluate(section.section, sectionEnvironment);

  if (result instanceof O.Err) {
    throw {
      message: result.inspect(),
      line: result.node.source.line,
      column: result.node.source.column,
    };
  }

  return result;
};

const evaluateSource = (
  source: string
): {
  environment: O.Enviornment;
  result: O.Obj;
  partOne?: O.Section;
  partTwo?: O.Section;
} => {
  const lexer = new Lexer(source);

  let ast: AST.Program;
  try {
    ast = new Parser(lexer).parse();
  } catch (err) {
    throw {
      message: `Parser error: ${err.message}`,
      line: err.token.line,
      column: err.token.column,
    };
  }

  const environment = new O.Environment();
  const result = evaluate(ast, environment);
  if (result instanceof O.Err) {
    throw {
      message: result.inspect(),
      line: result.node.source.line,
      column: result.node.source.column,
    };
  }

  const partOne = environment.getSection('part_one');
  const partTwo = environment.getSection('part_two');

  if (partOne.length === 0 && partTwo.length === 0) {
    return { environment, result };
  }

  if (partOne.length > 1) {
    throw {
      message: 'Runtime error: Expected a single `part_one` section',
      line: partOne[1].name.source.line,
      column: partOne[1].name.source.column,
    };
  }

  if (partTwo.length > 1) {
    throw {
      message: 'Runtime error: Expected a single `part_two` section',
      line: partTwo[1].name.source.line,
      column: partTwo[1].name.source.column,
    };
  }

  return {
    environment,
    result,
    partOne: partOne.length === 1 ? partOne[0] : undefined,
    partTwo: partTwo.length === 1 ? partTwo[0] : undefined,
  };
};

type Result =
  | {
      partOne: string | undefined;
      partTwo: string | undefined;
    }
  | {
      result: string;
    };

export const run = (source: string): Result => {
  const { environment, result, partOne, partTwo } = evaluateSource(source);

  if (!partOne && !partTwo) {
    return { result: result.inspect() };
  }

  const input = environment.getSection('input');
  if (input.length > 1) {
    throw {
      message: 'Runtime error: Expected a single `input` section',
      line: input[1].name.source.line,
      column: input[1].name.source.column,
    };
  }

  const inputResult = input.length === 1 ? evaluate(input[0].section, environment) : null;
  if (inputResult instanceof O.Err) {
    throw {
      message: inputResult.inspect(),
      line: inputResult.node.source.line,
      column: inputResult.node.source.column,
    };
  }

  return {
    partOne: partOne && evaluateSection(partOne, environment, inputResult).inspect(),
    partTwo: partTwo && evaluateSection(partTwo, environment, inputResult).inspect(),
  };
};

type TestCase = {
  partOne?: TestCaseResult;
  partTwo?: TestCaseResult;
};

type TestCaseResult = {
  expected: string;
  actual: string;
  hasPassed: boolean;
};

export const runTests = (source: string): TestCase[] => {
  const { environment, partOne, partTwo } = evaluateSource(source);

  return environment.getSection('test').map(test => {
    const testEnvironment = new O.Environment(environment);

    const testResult = evaluate(test.section, testEnvironment);
    if (testResult instanceof O.Err) {
      throw {
        message: testResult.inspect(),
        line: testResult.node.source.line,
        column: testResult.node.source.column,
      };
    }

    const partOneExpected = testEnvironment.getSection('part_one');
    const partTwoExpected = testEnvironment.getSection('part_two');

    if (partOneExpected.length === 0 && partTwoExpected.length === 0) {
      return {};
    }

    if (partOneExpected.length > 1) {
      throw {
        message: 'Runtime error: Expected a single testcase `part_one` section',
        line: partOneExpected[1].name.source.line,
        column: partOneExpected[1].name.source.column,
      };
    }

    if (partTwoExpected.length > 1) {
      throw {
        message: 'Runtime error: Expected a single testcase `part_two` section',
        line: partTwoExpected[1].name.source.line,
        column: partTwoExpected[1].name.source.column,
      };
    }

    const testInput = testEnvironment.getSection('input');
    if (testInput.length > 1) {
      throw {
        message: 'Runtime error: Expected a single testcase `input` section',
        line: testInput[1].name.source.line,
        column: testInput[1].name.source.column,
      };
    }

    const testInputResult =
      testInput.length === 1 ? evaluateSection(testInput[0], testEnvironment) : null;

    const testCase: TestCase = {};

    if (partOne && partOneExpected.length === 1) {
      const partOneExpectedResult = evaluateSection(partOneExpected[0], testEnvironment);
      const partOneActualResult = evaluateSection(partOne, testEnvironment, testInputResult);

      testCase.partOne = {
        expected: partOneExpectedResult.inspect(),
        actual: partOneActualResult.inspect(),
        hasPassed: partOneExpectedResult.equals(partOneActualResult),
      };
    }

    if (partTwo && partTwoExpected.length === 1) {
      const partTwoExpectedResult = evaluateSection(partTwoExpected[0], testEnvironment);
      const partTwoActualResult = evaluateSection(partTwo, testEnvironment, testInputResult);

      testCase.partTwo = {
        expected: partTwoExpectedResult.inspect(),
        actual: partTwoActualResult.inspect(),
        hasPassed: partTwoExpectedResult.equals(partTwoActualResult),
      };
    }

    return testCase;
  });
};
