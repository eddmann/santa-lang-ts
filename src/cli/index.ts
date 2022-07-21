#!/usr/bin/env node

import { readFileSync, realpathSync } from 'fs';
import { Lexer } from '../lexer';
import { AST, Parser } from '../parser';
import { evaluate, O } from '../evaluator';
import printSourcePreview from './printSourcePreview';

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
    printSourcePreview(filename, source, result.node.source.line, result.node.source.column);
    console.log('\x1b[32m%s\x1b[0m', result.inspect());
    process.exit(1);
  }

  return result;
};

let filename: string, source: string;
try {
  filename = process.argv[process.argv.length - 1];
  if (!filename.endsWith('.santa')) throw new Error();
  source = readFileSync(filename, { encoding: 'utf-8' });
} catch (err) {
  console.log('Unable to open source file');
  process.exit(1);
}

// ensure all file reads are relative to the `.santa` source location
process.chdir(require('path').dirname(realpathSync(filename)));

const lexer = new Lexer(source);
if (process.argv.includes('-l')) {
  console.log(JSON.stringify(lexer.readAll(), null, 2));
  process.exit(0);
}

let ast: AST.Program;
try {
  const parser = new Parser(lexer);
  ast = parser.parse();
  if (process.argv.includes('-p')) {
    console.log(JSON.stringify(ast, null, 2));
    process.exit(0);
  }
} catch (err) {
  printSourcePreview(filename, source, err.token.line, err.token.column);
  console.log('\x1b[32m%s\x1b[0m', `Parser error: ${err.message}`);
  process.exit(1);
}

const environment = new O.Environment();

const result = evaluate(ast, environment);
if (result instanceof O.Err) {
  printSourcePreview(filename, source, result.node.source.line, result.node.source.column);
  console.log('\x1b[32m%s\x1b[0m', result.inspect());
  process.exit(1);
}

const partOne = environment.getSection('part_one');
const partTwo = environment.getSection('part_two');

if (partOne.length === 0 && partTwo.length === 0) {
  console.log(result.inspect());
  process.exit(0);
}

if (partOne.length > 1) {
  printSourcePreview(filename, source, partOne[1].name.source.line, partOne[1].name.source.column);
  console.log('\x1b[32m%s\x1b[0m', 'Runtime error: Expected a single `part_one` section');
  process.exit(1);
}

if (partTwo.length > 1) {
  printSourcePreview(filename, source, partTwo[1].name.source.line, partTwo[1].name.source.column);
  console.log('\x1b[32m%s\x1b[0m', 'Runtime error: Expected a single `part_two` section');
  process.exit(1);
}

const input = environment.getSection('input');
if (input.length > 1) {
  printSourcePreview(filename, source, input[1].name.source.line, input[1].name.source.column);
  console.log('\x1b[32m%s\x1b[0m', 'Runtime error: Expected a single `input` section');
  process.exit(1);
}

const inputResult = evaluate(input[0].section, environment);
if (inputResult instanceof O.Err) {
  printSourcePreview(
    filename,
    source,
    inputResult.node.source.line,
    inputResult.node.source.column
  );
  console.log('\x1b[32m%s\x1b[0m', inputResult.inspect());
  process.exit(1);
}

if (!process.argv.includes('-t')) {
  const partOneResult = evaluateSection(partOne[0], environment, inputResult);
  console.log('Part 1: \x1b[32m%s\x1b[0m', partOneResult.inspect());

  const partTwoResult = evaluateSection(partTwo[0], environment, inputResult);
  console.log('Part 2: \x1b[32m%s\x1b[0m', partTwoResult.inspect());

  process.exit(0);
}

let exitCode = 0;
environment.getSection('test').forEach((test, idx) => {
  const testEnvironment = new O.Environment(environment);

  const testResult = evaluate(test.section, testEnvironment);
  if (testResult instanceof O.Err) {
    printSourcePreview(
      filename,
      source,
      testResult.node.source.line,
      testResult.node.source.column
    );
    console.log('\x1b[32m%s\x1b[0m', testResult.inspect());
    process.exit(1);
  }

  if (idx > 0) console.log();
  console.log('\x1b[4mTestcase #%s\x1b[0m', idx + 1);

  const partOneExpected = testEnvironment.getSection('part_one');
  const partTwoExpected = testEnvironment.getSection('part_two');

  if (partOneExpected.length === 0 && partTwoExpected.length === 0) {
    console.log('No expectations');
    return;
  }

  if (partOneExpected.length > 1) {
    printSourcePreview(
      filename,
      source,
      partOneExpected[1].name.source.line,
      partOneExpected[1].name.source.column
    );
    console.log(
      '\x1b[32m%s\x1b[0m',
      'Runtime error: Expected a single testcase `part_one` section'
    );
    process.exit(1);
  }

  if (partTwoExpected.length > 1) {
    printSourcePreview(
      filename,
      source,
      partTwoExpected[1].name.source.line,
      partTwoExpected[1].name.source.column
    );
    console.log(
      '\x1b[32m%s\x1b[0m',
      'Runtime error: Expected a single testcase `part_two` section'
    );
    process.exit(1);
  }

  const testInput = testEnvironment.getSection('input');
  if (testInput.length > 1) {
    printSourcePreview(
      filename,
      source,
      testInput[1].name.source.line,
      testInput[1].name.source.column
    );
    console.log('\x1b[32m%s\x1b[0m', 'Runtime error: Expected a single testcase `input` section');
    process.exit(1);
  }

  const testInputResult = evaluateSection(testInput[0], testEnvironment);

  const partOneExpectedResult = evaluateSection(partOneExpected[0], testEnvironment);
  const partOneActualResult = evaluateSection(partOne[0], testEnvironment, testInputResult);

  if (partOneExpectedResult.equals(partOneActualResult)) {
    console.log('Part 1: %s \x1b[32m✔️\x1b[0m', partOneActualResult.inspect());
  } else {
    console.log(
      'Part 1: %s \x1b[31m✘ (Expected: %s)\x1b[0m',
      partOneActualResult.inspect(),
      partOneExpectedResult.inspect()
    );
    exitCode = 1;
  }

  const partTwoExpectedResult = evaluateSection(partTwoExpected[0], testEnvironment);
  const partTwoActualResult = evaluateSection(partTwo[0], testEnvironment, testInputResult);

  if (partTwoExpectedResult.equals(partTwoActualResult)) {
    console.log('Part 2: %s \x1b[32m✔️\x1b[0m', partTwoActualResult.inspect());
  } else {
    console.log(
      'Part 2: %s \x1b[31m✘ (Expected: %s)\x1b[0m',
      partTwoActualResult.inspect(),
      partTwoExpectedResult.inspect()
    );
    exitCode = 1;
  }
});

process.exit(exitCode);
