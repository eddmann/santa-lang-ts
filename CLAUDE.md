# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

santa-lang-prancer is a TypeScript implementation of santa-lang, a functional, C-like programming language designed for solving Advent of Code puzzles. The language supports special `part_one:`, `part_two:`, `input:`, and `test:` sections for structuring AoC solutions.

## Repository Structure

The project is a monorepo with four packages in `src/`:

- **`lang/`** - Core language implementation (lexer, parser, evaluator, runner)
- **`cli/`** - Bun command-line interface for running `.santa` files
- **`web/`** - Next.js web-based editor/playground
- **`lambda/`** - AWS Lambda runtime layer

Each package has its own `package.json` with independent dependencies. The `cli`, `web`, and `lambda` packages depend on `lang` via file reference.

## Build Commands

All commands run through Docker via Makefile (uses `oven/bun:alpine`):

```bash
# Install dependencies
make lang/install
make cli/install
make web/install
make lambda/install

# Run tests
make lang/test          # Bun tests for core language
make cli/test           # CLI tests
make web/test           # ESLint

# Build artifacts
make cli/build          # Compile CLI binaries to src/cli/dist/
make web/build          # Next.js static export to src/web/out/
make lambda/build       # Package AWS Lambda layer to src/lambda/dist/layer.zip

# Interactive shell
make shell              # Opens sh in the Docker container
```

## Language Architecture

The interpreter follows a classic pipeline:

1. **Lexer** (`src/lang/src/lexer/`) - Tokenizes source into `Token[]`
2. **Parser** (`src/lang/src/parser/`) - Pratt parser producing an AST
3. **Evaluator** (`src/lang/src/evaluator/`) - Tree-walking interpreter
4. **Runner** (`src/lang/src/runner/`) - Orchestrates execution with section handling

### Key Implementation Details

- **AST nodes** are defined in `parser/ast.ts` with `ASTKind` enum discriminators
- **Object system** (`evaluator/object/`) uses classes for runtime values: `Integer`, `Decimal`, `Str`, `List`, `Dictionary`, `Set`, `Range`, `Func`, `BuiltinFunc`, etc.
- **Builtins** are in `evaluator/builtins/` organized by category: `math`, `collection`, `comparision`, `io`, `primitive`, `evaluate`
- **Tail call optimization** is implemented in `evaluator.ts` via `TailCallFunc` wrapper
- **Environment** handles variable scoping and section registration
- **Sections** (`part_one:`, `part_two:`, `input:`, `test:`) are stored on the environment and processed by the runner

### IO Interface

The `lang` package is runtime-agnostic. Each runtime (CLI, Lambda, Web) provides its own IO implementation:

```typescript
type IO = {
  input: (path: string) => string;   // Read file/URL content
  output: (args: string[]) => void;  // Print output
};
```

- **CLI** (`src/cli/src/io.ts`): Uses `Bun.spawnSync` with curl for HTTP, `fs` for files, supports `aoc://` protocol
- **Lambda** (`src/lambda/src/index.ts`): File-based input only
- **Web** (`src/web/worker.ts`): Uses XMLHttpRequest in a Web Worker

### Parser Precedence

The parser uses Pratt parsing with these precedence levels (lowest to highest):
`Lowest < AndOr < Equals < Identifier < LessGreater < Composition < Sum < Product < Call < Prefix < Index`

### Special Operators

- `|>` - Function threading (pipe)
- `>>` - Function composition
- `..` - Exclusive range
- `..=` - Inclusive range
- `` `fn` `` - Infix function call syntax

## Testing

Tests are colocated with source files as `*.test.ts`. The test files follow a pattern of testing expressions via a `doEvaluate()` helper that lexes, parses, and evaluates source strings.

```bash
make lang/test                                          # Run all tests
make shell                                              # Then inside container:
# cd src/lang && bun test src/lexer/lexer.test.ts       # Run single test file
```

### Bun Type Export Requirement

When re-exporting types in barrel files (index.ts), use explicit `export type` syntax for type-only exports. Bun requires this separation:

```typescript
// Correct
export { default as Lexer } from './lexer';
export { TokenKind } from './token';
export type { Token } from './token';

// Will fail in Bun
export { Lexer, TokenKind, Token } from './token';
```

## CLI Usage

After building with `make cli/build`, binaries are in `src/cli/dist/`:

```bash
src/cli/dist/santa-cli-macos-arm64 solution.santa      # Run solution (macOS ARM)
src/cli/dist/santa-cli-macos-x64 solution.santa        # Run solution (macOS Intel)
src/cli/dist/santa-cli-linux-x64 solution.santa        # Run solution (Linux)
src/cli/dist/santa-cli-linux-arm64 solution.santa      # Run solution (Linux ARM)
src/cli/dist/santa-cli-macos-arm64 -t solution.santa   # Run tests only
src/cli/dist/santa-cli-macos-arm64 -e '1 + 2'          # Eval inline code
```
