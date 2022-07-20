#!/usr/bin/env node

import { readFileSync } from 'fs';
import { Lexer } from '../lexer';
import { AST, Parser } from '../parser';
import { evaluate, O } from '../evaluator';
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

console.log(result.inspect());
process.exit(0);
