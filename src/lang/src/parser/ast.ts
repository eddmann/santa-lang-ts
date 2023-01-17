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
  Nil = 'NIL',
  Str = 'STRING',
  Bool = 'BOOLEAN',
  CommentStatement = 'COMMENT',
  FunctionLiteral = 'FUNCTION_LITERAL',
  CallExpression = 'CALL_EXPRESSION',
  IndexExpression = 'INDEX_EXPRESSION',
  PrefixExpression = 'PREFIX_EXPRESSION',
  InfixExpression = 'INFIX_EXPRESSION',
  ExpressionStatement = 'EXPRESSION',
  HashExpression = 'HASH_EXPRESSION',
  ListExpression = 'LIST_EXPRESSION',
  SetExpression = 'SET_EXPRESSION',
  RangeExpression = 'RANGE_EXPRESSION',
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
  | ReturnStatement
  | BreakStatement
  | SectionStatement
  | CommentStatement;

export type Expression =
  | ListExpression
  | SetExpression
  | RangeExpression
  | FunctionLiteral
  | IndexExpression
  | CallExpression
  | HashExpression
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
  | Nil
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

export type SourceLocation = {
  line: number;
  column: number;
};

export type Identifiable = ListDestructurePattern | Identifier | Placeholder | RestElement;

export type Program = {
  kind: ASTKind.Program;
  statements: Statement[];
  source: SourceLocation;
};

export type SectionStatement = {
  kind: ASTKind.Section;
  name: Identifier;
  section: BlockStatement;
  source: SourceLocation;
};

export type BlockStatement = {
  kind: ASTKind.BlockStatement;
  statements: Statement[];
  source: SourceLocation;
};

export type ExpressionStatement = {
  kind: ASTKind.ExpressionStatement;
  expression: Expression;
  source: SourceLocation;
};

export type LetStatement = {
  kind: ASTKind.Let;
  name: ListDestructurePattern | Identifier;
  value: Expression;
  isMutable: boolean;
  source: SourceLocation;
};

export type AssignmentExpression = {
  kind: ASTKind.Assignment;
  name: Identifier;
  value: Expression;
  source: SourceLocation;
};

export type ReturnStatement = {
  kind: ASTKind.Return;
  returnValue: Expression;
  source: SourceLocation;
};

export type BreakStatement = {
  kind: ASTKind.Break;
  value: Expression | null;
  source: SourceLocation;
};

export type Integer = {
  kind: ASTKind.Integer;
  value: number;
  source: SourceLocation;
};

export type Decimal = {
  kind: ASTKind.Decimal;
  value: number;
  source: SourceLocation;
};

export type Placeholder = {
  kind: ASTKind.Placeholder;
  source: SourceLocation;
};

export type Nil = {
  kind: ASTKind.Nil;
  source: SourceLocation;
};

export type Str = {
  kind: ASTKind.Str;
  value: string;
  source: SourceLocation;
};

export type Bool = {
  kind: ASTKind.Bool;
  value: boolean;
  source: SourceLocation;
};

export type CommentStatement = {
  kind: ASTKind.CommentStatement;
  value: string;
  source: SourceLocation;
};

export type RangeExpression = {
  kind: ASTKind.RangeExpression;
  start: Expression;
  end: Expression;
  isInclusive: boolean;
  source: SourceLocation;
};

export type Identifier = {
  kind: ASTKind.Identifier;
  value: string;
  source: SourceLocation;
};

export type ListExpression = {
  kind: ASTKind.ListExpression;
  elements: (Expression | SpreadElement)[];
  source: SourceLocation;
};

export type SetExpression = {
  kind: ASTKind.SetExpression;
  elements: Expression[];
  source: SourceLocation;
};

export type CallExpression = {
  kind: ASTKind.CallExpression;
  function: Callable;
  arguments: Expression[];
  source: SourceLocation;
};

export type PrefixExpression = {
  kind: ASTKind.PrefixExpression;
  function: Identifier;
  argument: Expression;
  source: SourceLocation;
};

export type InfixExpression = {
  kind: ASTKind.InfixExpression;
  function: Identifier;
  arguments: [left: Expression, right: Expression];
  source: SourceLocation;
};

export type FunctionLiteral = {
  kind: ASTKind.FunctionLiteral;
  parameters: Identifiable[];
  body: BlockStatement;
  source: SourceLocation;
};

export type FunctionThread = {
  kind: ASTKind.FunctionThread;
  initial: Expression;
  functions: Callable[];
  source: SourceLocation;
};

export type FunctionComposition = {
  kind: ASTKind.FunctionComposition;
  functions: Callable[];
  source: SourceLocation;
};

export type HashExpression = {
  kind: ASTKind.HashExpression;
  pairs: [key: Expression, value: Expression][];
  source: SourceLocation;
};

export type MatchExpression = {
  kind: ASTKind.MatchExpression;
  subject: Expression;
  cases: MatchCase[];
  source: SourceLocation;
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
  source: SourceLocation;
};

export type IfExpression = {
  kind: ASTKind.IfExpression;
  condition: Expression;
  consequence: BlockStatement;
  alternative: BlockStatement | null;
  source: SourceLocation;
};

export type IndexExpression = {
  kind: ASTKind.IndexExpression;
  item: Expression;
  index: Expression;
  source: SourceLocation;
};

export type ListDestructurePattern = {
  kind: ASTKind.ListDestructurePattern;
  elements: Identifiable[];
  source: SourceLocation;
};

export type RestElement = {
  kind: ASTKind.RestElement;
  argument: Identifier;
  source: SourceLocation;
};

export type SpreadElement = {
  kind: ASTKind.SpreadElement;
  value: Expression;
  source: SourceLocation;
};
