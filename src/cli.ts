#!/usr/bin/env node

import { readFileSync } from 'fs';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { evaluate, O } from './evaluator';

let source;
try {
  const filename = process.argv[process.argv.length - 1];
  if (!filename.endsWith('.santa')) throw new Error();
  source = readFileSync(filename, { encoding: 'utf-8' });
} catch (err) {
  console.log('Unable to open source file');
  process.exit(1);
}

const lexer = new Lexer(source);
if (process.argv.includes('-l')) {
  console.log(JSON.stringify(lexer.readAll(), null, 2));
  process.exit(0);
}

const parser = new Parser(lexer);
if (process.argv.includes('-p')) {
  console.log(JSON.stringify(parser.parse(), null, 2));
  process.exit(0);
}

const environment = new O.Environment();
const result = evaluate(parser.parse(), environment);

if (result instanceof O.Err) {
  console.log(result.message);
  process.exit(1);
}

console.log(result.inspect());
process.exit(0);
