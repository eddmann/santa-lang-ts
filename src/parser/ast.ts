export enum ASTKind {
  Program = 'PROGRAM',
  Assignment = 'ASSIGNMENT',
  Let = 'LET',
  Return = 'RETURN',
  Break = 'BREAK',
  BlockStatement = 'BLOCK_STATEMENT',
  Section = 'SECTION',
  Identifier = 'IDENTIFIER',
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
  ListDestructurePattern = 'LIST_DESTRUCTURE_PATTERN',
  ListMatchPattern = 'LIST_MATCH_PATTERN',
  RestElement = 'REST_ELEMENT',
  SpreadElement = 'SPREAD_ELEMENT',
  FunctionThread = 'FUNCTION_THEAD',
  FunctionComposition = 'FUNCTION_COMPOSITON',
}

export type Node = Program | Statement | Expression;

export type Statement =
  | BlockStatement
  | ExpressionStatement
  | LetStatement
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
  | Bool
  | RestElement
  | SpreadElement
  | ListDestructurePattern
  | ListMatchPattern;

export type Callable =
  | Identifier
  | FunctionLiteral
  | CallExpression
  | InfixExpression
  | PrefixExpression
  | FunctionComposition;

export type Identifiable = ListDestructurePattern | Identifier | Placeholder | RestElement;

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

export type LetStatement = {
  kind: ASTKind.Let;
  name: ListDestructurePattern | Identifier;
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
  value: Expression | null;
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

export type ListLiteral = {
  kind: ASTKind.ListLiteral;
  elements: (Expression | SpreadElement)[];
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
  arguments: [left: Expression, right: Expression];
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
  pattern: MatchPattern;
  guard: Expression | null;
  consequence: BlockStatement;
};

export type MatchPattern =
  | Identifier
  | Placeholder
  | Str
  | Bool
  | Decimal
  | Integer
  | ListMatchPattern
  | RestElement;

export type ListMatchPattern = {
  kind: ASTKind.ListMatchPattern;
  elements: MatchPattern[];
};

export type IfExpression = {
  kind: ASTKind.IfExpression;
  condition: Expression;
  consequence: BlockStatement;
  alternative: BlockStatement | null;
};

export type IndexExpression = {
  kind: ASTKind.IndexExpression;
  item: Expression;
  index: Expression;
};

export type ListDestructurePattern = {
  kind: ASTKind.ListDestructurePattern;
  elements: Identifiable[];
};

export type RestElement = {
  kind: ASTKind.RestElement;
  argument: Identifier;
};

export type SpreadElement = {
  kind: ASTKind.SpreadElement;
  value: Expression;
};
