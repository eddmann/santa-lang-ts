#!/usr/bin/env bun

import { readFileSync, realpathSync } from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import { run, runTests } from 'santa-lang/runner';
import { Lexer } from 'santa-lang/lexer';
import { Parser } from 'santa-lang/parser';
import { evaluate, O } from 'santa-lang/evaluator';
import printSourcePreview from './printSourcePreview';
import io from './io';
import pkg from '../package.json';

// Parse command line arguments
const args = process.argv.slice(2);

// Read stdin synchronously (returns null if stdin is a TTY or empty)
function readStdinSync(): string | null {
  if (process.stdin.isTTY) {
    return null;
  }

  try {
    // Read stdin synchronously using file descriptor 0
    return readFileSync(0, { encoding: 'utf-8' });
  } catch {
    return null;
  }
}

function printHelp() {
  console.log(`santa-lang CLI - Prancer ${pkg.version}`);
  console.log();
  console.log('USAGE:');
  console.log('    santa-cli <SCRIPT>              Run solution file');
  console.log('    santa-cli -e <CODE>             Evaluate inline script');
  console.log('    santa-cli -t <SCRIPT>           Run test suite');
  console.log('    santa-cli -t -s <SCRIPT>        Run tests including @slow');
  console.log('    santa-cli -r                    Start REPL');
  console.log('    santa-cli -h                    Show this help');
  console.log('    cat file | santa-cli            Read from stdin');
  console.log();
  console.log('OPTIONS:');
  console.log('    -e, --eval <CODE>    Evaluate inline script');
  console.log('    -t, --test           Run the solution\'s test suite');
  console.log('    -s, --slow           Include @slow tests (use with -t)');
  console.log('    -r, --repl           Start interactive REPL');
  console.log('    -h, --help           Show this help message');
  console.log('    -v, --version        Display version information');
  console.log();
  console.log('ENVIRONMENT:');
  console.log('    SANTA_CLI_SESSION_TOKEN    AOC session token for aoc:// URLs');
}

function runRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> ',
  });

  const environment = new O.Environment();
  environment.setIO(io);

  console.log(
    '   ,--.\n  ()   \\\n   /    \\\n _/______\\_\n(__________)\n(/  @  @  \\)\n(`._,()._,\')  Santa REPL\n(  `-\'`-\'  )\n \\        /\n  \\,,,,,,/\n'
  );

  rl.prompt();

  rl.on('line', (line: string) => {
    if (line.trim() === '') {
      rl.prompt();
      return;
    }

    try {
      const lexer = new Lexer(line);
      const parser = new Parser(lexer);
      const result = evaluate(parser.parse(), environment);
      if (result instanceof O.Err) {
        console.log(result.inspect());
      } else {
        console.log(result.inspect());
      }
    } catch (err: any) {
      console.log(err.message || String(err));
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Goodbye');
    process.exit(0);
  });
}

// Check for help flag
if (args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

// Check for version flag
if (args.includes('-v') || args.includes('--version')) {
  console.log(`santa-lang Prancer ${pkg.version}`);
  process.exit(0);
}

// Check for REPL flag
if (args.includes('-r') || args.includes('--repl')) {
  runRepl();
} else {
  // Run script or tests
  const isTestRun = args.includes('-t') || args.includes('--test');
  const includeSlow = args.includes('-s') || args.includes('--slow');

  // Check for -e/--eval flag
  const evalIndex = args.findIndex(arg => arg === '-e' || arg === '--eval');
  const evalScript = evalIndex !== -1 && args[evalIndex + 1] ? args[evalIndex + 1] : null;

  // Find the script file (argument that ends with .santa)
  const scriptFile = args.find(arg => arg.endsWith('.santa'));

  // Determine source: -e > file > stdin
  let filename: string | null = null;
  let source: string;

  if (evalScript) {
    // Eval mode - use inline script
    source = evalScript;
  } else if (scriptFile) {
    // File mode
    try {
      filename = scriptFile;
      source = readFileSync(filename, { encoding: 'utf-8' });
    } catch {
      console.log('Unable to open source file');
      process.exit(1);
    }
  } else {
    // Try stdin
    const stdinData = readStdinSync();
    if (stdinData !== null) {
      source = stdinData;
    } else {
      printHelp();
      process.exit(1);
    }
  }

  // Only change directory if we have a file path
  if (filename) {
    process.chdir(path.dirname(realpathSync(filename)));
  }

  try {
    if (!isTestRun) {
      const result = run(source, io);

      if ('value' in result) {
        console.log(result.value);
        process.exit(0);
      }

      if (result.partOne) {
        console.log(
          'Part 1: \x1b[32m%s\x1b[0m \x1b[90m%sms\x1b[0m',
          result.partOne.value,
          result.partOne.duration
        );
      }

      if (result.partTwo) {
        console.log(
          'Part 2: \x1b[32m%s\x1b[0m \x1b[90m%sms\x1b[0m',
          result.partTwo.value,
          result.partTwo.duration
        );
      }

      process.exit(0);
    }

    let exitCode = 0;

    for (const [idx, testCase] of Object.entries(runTests(source, io, includeSlow))) {
      if (Number(idx) > 0) console.log();

      if (testCase.slow) {
        console.log('\x1b[4mTestcase #%s\x1b[0m \x1b[33m(slow)\x1b[0m', Number(idx) + 1);
      } else {
        console.log('\x1b[4mTestcase #%s\x1b[0m', Number(idx) + 1);
      }

      if (!testCase.partOne && !testCase.partTwo) {
        console.log('No expectations');
        continue;
      }

      if (testCase.partOne) {
        if (testCase.partOne.hasPassed) {
          console.log('Part 1: %s \x1b[32m✔\x1b[0m', testCase.partOne.actual);
        } else {
          console.log(
            'Part 1: %s \x1b[31m✘ (Expected: %s)\x1b[0m',
            testCase.partOne.actual,
            testCase.partOne.expected
          );
          exitCode = 3;
        }
      }

      if (testCase.partTwo) {
        if (testCase.partTwo.hasPassed) {
          console.log('Part 2: %s \x1b[32m✔\x1b[0m', testCase.partTwo.actual);
        } else {
          console.log(
            'Part 2: %s \x1b[31m✘ (Expected: %s)\x1b[0m',
            testCase.partTwo.actual,
            testCase.partTwo.expected
          );
          exitCode = 3;
        }
      }
    }

    process.exit(exitCode);
  } catch (err: any) {
    printSourcePreview(filename || '<stdin>', source, err.line, err.column);
    console.log('\x1b[32m%s\x1b[0m', err.message);
    process.exit(2);
  }
}
