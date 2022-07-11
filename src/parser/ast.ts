export enum ASTKind {
  Program = 'PROGRAM',
  Assignment = 'ASSIGNMENT',
  Let = 'LET',
  LetListDestructure = 'LET_LIST_DESTRUCTURE',
  Return = 'RETURN',
  Break = 'BREAK',
  BlockStatement = 'BLOCK_STATEMENT',
  Section = 'SECTION',
  Identifier = 'IDENTIFIER',
  IdentifierGlob = 'IDENTIFIER_GLOB',
  IdentifierListDestructure = 'IDENTIFIER_LIST_DESTRUCTURE',
  IfExpression = 'IF_EXPRESSION',
  MatchExpression = 'MATCH_EXPRESSION',
  Integer = 'INTEGER',
  Decimal = 'DECIMAL',
  Placeholder = 'PLACEHOLDER',
  Str = 'STRING',
  Bool = 'BOOLEAN',
  CallExpression = 'CALL_EXPRESSION',
  IndexExpression = 'INDEX_EXPRESSION',
  PrefixExpression = 'PREFIX_EXPRESSION',
  InfixExpression = 'INFIX_EXPRESSION',
  ExpressionStatement = 'EXPRESSION',
  FunctionLiteral = 'FUNCTION_LITERAL',
  HashLiteral = 'HASH_LITERAL',
  ListLiteral = 'LIST_LITERAL',
  SetLiteral = 'SET_LITERAL',
  RangeLiteral = 'RANGE_LITERAL',
  FunctionThread = 'FUNCTION_THEAD',
  FunctionComposition = 'FUNCTION_COMPOSITON',
}

export type Node = Program | Statement | Expression;

export type Statement =
  | BlockStatement
  | ExpressionStatement
  | LetStatement
  | LetListDestructureStatement
  | ReturnStatment
  | BreakStatment
  | SectionStatement;

export type Expression =
  | ListLiteral
  | SetLiteral
  | RangeLiteral
  | FunctionLiteral
  | IndexExpression
  | CallExpression
  | HashLiteral
  | Identifier
  | IdentifierGlob
  | IfExpression
  | MatchExpression
  | PrefixExpression
  | InfixExpression
  | AssignmentExpression
  | FunctionThread
  | FunctionComposition
  | Integer
  | Decimal
  | Placeholder
  | Str
  | Bool;

export type Callable =
  | Identifier
  | FunctionLiteral
  | CallExpression
  | InfixExpression
  | PrefixExpression
  | FunctionComposition;

export type Identifiable = Identifier | IdentifierGlob | IdentifierListDestructure;

export type Program = {
  kind: ASTKind.Program;
  statements: Statement[];
};

export type SectionStatement = {
  kind: ASTKind.Section;
  name: Identifier;
  section: BlockStatement;
};

export type BlockStatement = {
  kind: ASTKind.BlockStatement;
  statements: Statement[];
};

export type ExpressionStatement = {
  kind: ASTKind.ExpressionStatement;
  expression: Expression;
};

export type LetListDestructureStatement = {
  kind: ASTKind.LetListDestructure;
  names: (Identifiable | Placeholder)[];
  value: Expression;
  isMutable: boolean;
};

export type LetStatement = {
  kind: ASTKind.Let;
  name: Identifier;
  value: Expression;
  isMutable: boolean;
};

export type AssignmentExpression = {
  kind: ASTKind.Assignment;
  name: Identifier;
  value: Expression;
};

export type ReturnStatment = {
  kind: ASTKind.Return;
  returnValue: Expression;
};

export type BreakStatment = {
  kind: ASTKind.Break;
  value: Expression;
};

export type Integer = {
  kind: ASTKind.Integer;
  value: number;
};

export type Decimal = {
  kind: ASTKind.Decimal;
  value: number;
};

export type Placeholder = {
  kind: ASTKind.Placeholder;
};

export type Str = {
  kind: ASTKind.Str;
  value: string;
};

export type Bool = {
  kind: ASTKind.Bool;
  value: boolean;
};

export type RangeLiteral = {
  kind: ASTKind.RangeLiteral;
  start: Expression;
  end: Expression;
};

export type Identifier = {
  kind: ASTKind.Identifier;
  value: string;
};

export type IdentifierListDestructure = {
  kind: ASTKind.IdentifierListDestructure;
  values: Identifiable[];
};

export type IdentifierGlob = {
  kind: ASTKind.IdentifierGlob;
  value: string;
};

export type ListLiteral = {
  kind: ASTKind.ListLiteral;
  elements: Expression[];
};

export type SetLiteral = {
  kind: ASTKind.SetLiteral;
  elements: Expression[];
};

export type CallExpression = {
  kind: ASTKind.CallExpression;
  function: Callable;
  arguments: Expression[];
};

export type PrefixExpression = {
  kind: ASTKind.PrefixExpression;
  function: Identifier;
  argument: Expression;
};

export type InfixExpression = {
  kind: ASTKind.InfixExpression;
  function: Identifier;
  arguments: [Expression, Expression];
};

export type FunctionLiteral = {
  kind: ASTKind.FunctionLiteral;
  parameters: Identifiable[];
  body: BlockStatement;
};

export type FunctionThread = {
  kind: ASTKind.FunctionThread;
  initial: Expression;
  functions: Callable[];
};

export type FunctionComposition = {
  kind: ASTKind.FunctionComposition;
  functions: Callable[];
};

export type HashLiteral = {
  kind: ASTKind.HashLiteral;
  pairs: [key: Expression, value: Expression][];
};

export type MatchExpression = {
  kind: ASTKind.MatchExpression;
  subject: Expression;
  cases: MatchCase[];
};

export type MatchCase = {
  pattern: Expression;
  guard: Expression | null;
  consequence: BlockStatement;
};

export type IfExpression = {
  kind: ASTKind.IfExpression;
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement;
};

export type IndexExpression = {
  kind: ASTKind.IndexExpression;
  item: Expression;
  index: Expression;
};
