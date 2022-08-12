#!/usr/bin/env node

import { readFileSync, realpathSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { run, runTests } from 'santa-lang/runner';
import printSourcePreview from './printSourcePreview';

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

const io = {
  input: (path: string): string => {
    let url = {};
    try {
      url = new URL(path);
    } catch (err) {}

    if (url.protocol === 'aoc:') {
      const token = process.env.SANTA_CLI_SESSION_TOKEN;

      if (!token) {
        throw new Error(
          `Unable to read AOC input: ${path}, missing session token within SANTA_CLI_SESSION_TOKEN environment variable`
        );
      }

      const year = url.host;
      const day = url.pathname.substr(1);

      try {
        return readFileSync(`aoc${year}_day${day}.input`, { encoding: 'utf-8' });
      } catch (err) {}

      let content, error;

      fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
        method: 'GET',
        headers: {
          Accepts: 'text/plain',
          Cookie: `session=${token}`,
        },
      }).then(response => {
        if (response.status !== 200) {
          error = `Unable to read AOC input: ${path}, response: ${response.statusText}`;
          return;
        }

        return response.text().then(body => {
          content = body;
        });
      });

      require('deasync').loopWhile(() => !content && !error);

      if (error) {
        throw new Error(error);
      }

      writeFileSync(`aoc${year}_day${day}.input`, content);

      return content;
    }

    if (url.protocol) {
      let content, error;

      fetch(path, {
        method: 'GET',
        headers: {
          Accepts: 'text/plain',
        },
      }).then(response => {
        if (response.status !== 200) {
          error = `Unable to read HTTP input: ${path}, response: ${response.statusText}`;
          return;
        }

        return response.text().then(body => {
          content = body;
        });
      });

      require('deasync').loopWhile(() => !content && !error);

      if (error) {
        throw new Error(error);
      }

      return content;
    }

    try {
      return readFileSync(path, { encoding: 'utf-8' });
    } catch (err) {
      throw new Error(`Unable to read path: ${path}`);
    }
  },
  output: (args: string[]) => console.log(...args),
};

const isTestRun = process.argv.includes('-t');
try {
  if (!isTestRun) {
    const result = run(source, io);

    if (result.result) {
      console.log(result.result);
      process.exit(0);
    }

    if (result.partOne) {
      console.log('Part 1: \x1b[32m%s\x1b[0m', result.partOne);
    }

    if (result.partTwo) {
      console.log('Part 2: \x1b[32m%s\x1b[0m', result.partTwo);
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
