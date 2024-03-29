export enum TokenKind {
  Illegal = 'ILLEGAL',
  EOF = 'EOF',
  Identifier = 'IDENTIFIER',
  Integer = 'INTEGER',
  Decimal = 'DECIMAL',
  Str = 'STRING',
  Comment = 'COMMENT',
  Assign = '=',
  Plus = '+',
  Minus = '-',
  Bang = '!',
  Asterisk = '*',
  Slash = '/',
  Modulo = '%',
  LessThan = '<',
  LessThanEqual = '<=',
  GreaterThan = '>',
  GreaterThanEqual = '>=',
  Equal = '==',
  NotEqual = '!=',
  Comma = ',',
  Semicolon = ';',
  Colon = ':',
  LParen = '(',
  RParen = ')',
  LBrace = '{',
  HashLBrace = '#{',
  RBrace = '}',
  LBracket = '[',
  RBracket = ']',
  Underscore = '_',
  Dot = '.',
  DotDot = '..',
  DotDotEqual = '..=',
  Backtick = '`',
  Hash = '#',
  Pipe = '|',
  PipePipe = '||',
  Amp = '&',
  AmpAmp = '&&',
  PipeGreater = '|>',
  GreaterGreater = '>>',
  Mutable = 'MUTABLE',
  Match = 'MATCH',
  Let = 'LET',
  True = 'TRUE',
  False = 'FALSE',
  If = 'IF',
  Else = 'ELSE',
  Return = 'RETURN',
  Break = 'BREAK',
  Nil = 'NIL',
}

export type Token = {
  kind: TokenKind;
  literal: string;
  line: number;
  column: number;
};

export const keywords: { [keyword: string]: TokenKind } = {
  let: TokenKind.Let,
  mut: TokenKind.Mutable,
  true: TokenKind.True,
  false: TokenKind.False,
  if: TokenKind.If,
  else: TokenKind.Else,
  return: TokenKind.Return,
  break: TokenKind.Break,
  match: TokenKind.Match,
  nil: TokenKind.Nil,
};
