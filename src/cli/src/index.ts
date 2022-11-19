#!/usr/bin/env node

import { readFileSync, realpathSync } from 'fs';
import { run, runTests } from 'santa-lang/runner';
import printSourcePreview from './printSourcePreview';
import io from './io';

let filename: string, source: string;
try {
  filename = process.argv[process.argv.length - 1];
  if (!filename.endsWith('.santa')) throw new Error();
  source = readFileSync(filename, { encoding: 'utf-8' });
} catch (err) {
  console.log('Unable to open source file');
  process.exit(1);
}

// ensure all files read are relative to the `.santa` source location
process.chdir(require('path').dirname(realpathSync(filename)));

const toSeconds = (milliseconds: number): string =>
  `${Math.floor(milliseconds / 1000)}.${milliseconds % 1000}`;

const isTestRun = process.argv.includes('-t');
try {
  if (!isTestRun) {
    const result = run(source, io);

    if (result.value) {
      console.log(result.value);
      process.exit(0);
    }

    if (result.partOne) {
      console.log(
        'Part 1: \x1b[32m%s\x1b[0m \x1b[90m%ss\x1b[0m',
        result.partOne.value,
        toSeconds(result.partOne.duration)
      );
    }

    if (result.partTwo) {
      console.log(
        'Part 2: \x1b[32m%s\x1b[0m \x1b[90m%ss\x1b[0m',
        result.partTwo.value,
        toSeconds(result.partTwo.duration)
      );
    }

    process.exit(0);
  }

  let exitCode = 0;

  for (const [idx, testCase] of Object.entries(runTests(source, io))) {
    if (idx > 0) console.log();
    console.log('\x1b[4mTestcase #%s\x1b[0m', Number(idx) + 1);

    if (!testCase) {
      console.log('No expectations');
      continue;
    }

    if (testCase.partOne) {
      if (testCase.partOne.hasPassed) {
        console.log('Part 1: %s \x1b[32m✔️\x1b[0m', testCase.partOne.actual);
      } else {
        console.log(
          'Part 1: %s \x1b[31m✘ (Expected: %s)\x1b[0m',
          testCase.partOne.actual,
          testCase.partOne.expected
        );
        exitCode = 1;
      }
    }

    if (testCase.partTwo) {
      if (testCase.partTwo.hasPassed) {
        console.log('Part 2: %s \x1b[32m✔️\x1b[0m', testCase.partTwo.actual);
      } else {
        console.log(
          'Part 2: %s \x1b[31m✘ (Expected: %s)\x1b[0m',
          testCase.partTwo.actual,
          testCase.partTwo.expected
        );
        exitCode = 1;
      }
    }
  }

  process.exit(exitCode);
} catch (err) {
  printSourcePreview(filename, source, err.line, err.column);
  console.log('\x1b[32m%s\x1b[0m', err.message);
  process.exit(1);
}
