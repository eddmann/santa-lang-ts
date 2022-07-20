import * as AST from './ast';
import { Lexer, TokenKind, Token } from '../lexer';

enum Precedence {
  Lowest,
  AndOr,
  Equals,
  Identifier,
  LessGreater,
  Sum,
  Product,
  Call,
  Prefix,
  Index,
}

type ExpressionParser = Partial<{
  [K in TokenKind]: {
    precedence: Precedence;
    prefix: () => AST.Expression;
    infix?: (left: AST.Expression) => AST.Expression;
  };
}>;

export class ParserError extends Error {
  constructor(message: string, public token: Token) {
    super(message);
    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

export default class Parser {
  curToken: Token;
  peekToken: Token;
  expressionParser: ExpressionParser;

  constructor(private lexer: Lexer) {
    this.expressionParser = {
      [TokenKind.Match]: { precedence: Precedence.Identifier, prefix: this.parseMatchExpression },
      [TokenKind.Identifier]: {
        precedence: Precedence.Identifier,
        prefix: () => this.parseIdentifier(),
      },
      [TokenKind.True]: { precedence: Precedence.Identifier, prefix: this.parseBooleon },
      [TokenKind.False]: { precedence: Precedence.Identifier, prefix: this.parseBooleon },
      [TokenKind.Integer]: { precedence: Precedence.Identifier, prefix: this.parseInteger },
      [TokenKind.Decimal]: { precedence: Precedence.Identifier, prefix: this.parseDecimal },
      [TokenKind.Str]: { precedence: Precedence.Identifier, prefix: this.parseString },
      [TokenKind.Underscore]: { precedence: Precedence.Identifier, prefix: this.parsePlaceholder },
      [TokenKind.Nil]: { precedence: Precedence.Identifier, prefix: this.parseNil },
      [TokenKind.DotDot]: {
        precedence: Precedence.Sum,
        prefix: this.parseIdentifier,
        infix: this.parseRangeExpression,
      },
      [TokenKind.Bang]: { precedence: Precedence.Equals, prefix: this.parsePrefixExpression },
      [TokenKind.Plus]: {
        precedence: Precedence.Sum,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.Minus]: {
        precedence: Precedence.Sum,
        prefix: this.parsePrefixExpression,
        infix: this.parseInfixExpression,
      },
      [TokenKind.Asterisk]: {
        precedence: Precedence.Product,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.Slash]: {
        precedence: Precedence.Product,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.Modulo]: {
        precedence: Precedence.Product,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.Equal]: {
        precedence: Precedence.Equals,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.NotEqual]: {
        precedence: Precedence.Equals,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.LessThan]: {
        precedence: Precedence.LessGreater,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.GreaterThan]: {
        precedence: Precedence.LessGreater,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.AmpAmp]: {
        precedence: Precedence.AndOr,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.Pipe]: { precedence: Precedence.Identifier, prefix: this.parseFunctionLiteral },
      [TokenKind.PipePipe]: {
        precedence: Precedence.AndOr,
        prefix: this.parseFunctionLiteral,
        infix: this.parseInfixExpression,
      },
      [TokenKind.PipeGreater]: {
        precedence: Precedence.Identifier,
        prefix: this.parseIdentifier,
        infix: this.parseFunctionThread,
      },
      [TokenKind.GreaterGreater]: {
        precedence: Precedence.LessGreater,
        prefix: this.parseIdentifier,
        infix: this.parseFunctionComposition,
      },
      [TokenKind.LParen]: {
        precedence: Precedence.Call,
        prefix: this.parseGroupedExpression,
        infix: this.parseCallExpression,
      },
      [TokenKind.Backtick]: {
        precedence: Precedence.Product,
        prefix: this.parseIdentifier,
        infix: this.parseInfixExpression,
      },
      [TokenKind.If]: { precedence: Precedence.Identifier, prefix: this.parseIfExpression },
      [TokenKind.HashLBrace]: { precedence: Precedence.Lowest, prefix: this.parseHashExpression },
      [TokenKind.LBrace]: { precedence: Precedence.Lowest, prefix: this.parseSetExpression },
      [TokenKind.LBracket]: {
        precedence: Precedence.Index,
        prefix: this.parseListExpression,
        infix: this.parseIndexExpression,
      },
      [TokenKind.Assign]: {
        precedence: Precedence.Equals,
        prefix: this.parseIdentifier,
        infix: this.parseAssignment,
      },
    };

    this.curToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();
  }

  public parse(): AST.Program {
    const source = this.captureSourceLocation();

    const statements: AST.Statement[] = [];

    while (this.curToken.kind !== TokenKind.EOF) {
      statements.push(this.parseStatement());
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Program,
      statements,
      source,
    };
  }

  private parseStatement(): AST.Statement {
    switch (this.curToken.kind) {
      case TokenKind.Let:
        return this.parseLetStatement();
      case TokenKind.Return:
        return this.parseReturnStatement();
      case TokenKind.Break:
        return this.parseBreakStatement();
      case TokenKind.Comment:
        return this.parseComment();
      case TokenKind.Identifier:
        if (this.peekTokenIs(TokenKind.Colon)) {
          return this.parseSectionStatement();
        }
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): AST.LetStatement {
    const source = this.captureSourceLocation();

    const isMutable = this.peekTokenIs(TokenKind.Mutable);
    if (isMutable) {
      this.nextToken();
    }

    this.nextToken();

    let name: AST.ListDestructurePattern | AST.Identifier;
    if (this.curTokenIs(TokenKind.Identifier)) {
      name = this.parseIdentifier();
    } else if (this.curTokenIs(TokenKind.LBracket)) {
      name = this.parseListDestructurePattern();
    } else {
      throw new ParserError(
        `Expected token to be ${TokenKind.Identifier} or ${TokenKind.LBracket}, but received ${this.curToken.kind}`,
        this.curToken
      );
    }

    this.expectPeek(TokenKind.Assign);
    this.nextToken();

    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Let,
      name,
      value,
      isMutable,
      source,
    };
  }

  private parseReturnStatement(): AST.ReturnStatment {
    const source = this.captureSourceLocation();

    this.nextToken();

    const returnValue = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Return,
      returnValue,
      source,
    };
  }

  private parseBreakStatement(): AST.BreakStatment {
    const source = this.captureSourceLocation();

    this.nextToken();

    const value = this.expressionParser[this.curToken.kind]
      ? this.parseExpression(Precedence.Lowest)
      : null;

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Break,
      value,
      source,
    };
  }

  private parseSectionStatement(): AST.SectionStatement {
    const source = this.captureSourceLocation();

    const name = this.parseIdentifier();

    this.nextToken();
    this.nextToken();

    const section: AST.BlockStatement = this.curTokenIs(TokenKind.LBrace)
      ? this.parseBlockStatement()
      : {
          kind: AST.ASTKind.BlockStatement,
          statements: [this.parseExpressionStatement()],
        };

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Section,
      name,
      section,
      source,
    };
  }

  private parseBlockStatement(): AST.BlockStatement {
    const source = this.captureSourceLocation();

    const statements: AST.Statement[] = [];

    this.nextToken();

    while (!this.curTokenIs(TokenKind.RBrace) && !this.curTokenIs(TokenKind.EOF)) {
      statements.push(this.parseStatement());
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.BlockStatement,
      statements,
      source,
    };
  }

  private parseExpressionStatement(): AST.ExpressionStatement {
    const source = this.captureSourceLocation();

    const expression = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.ExpressionStatement,
      expression,
      source,
    };
  }

  private parseExpression(precedence: Precedence): AST.Expression {
    const parser = this.expressionParser[this.curToken.kind];

    if (!parser) {
      throw new ParserError(`Unknown use of ${this.curToken.kind} as an expression`, this.curToken);
    }

    let left = parser.prefix();

    while (
      !this.peekTokenIs(TokenKind.Semicolon) &&
      precedence < this.getPrecedence(this.peekToken)
    ) {
      const parser = this.expressionParser[this.peekToken.kind];

      if (!parser || !parser.infix) {
        return left;
      }

      this.nextToken();

      left = parser.infix(left);
    }

    return left;
  }

  private parsePrefixExpression = (): AST.PrefixExpression => {
    const source = this.captureSourceLocation();

    const expression = this.parseIdentifier();

    this.nextToken();

    return {
      kind: AST.ASTKind.PrefixExpression,
      function: {
        kind: AST.ASTKind.Identifier,
        value: `unary_${expression.value}`,
        source: this.captureSourceLocation(),
      },
      argument: this.parseExpression(Precedence.Prefix),
      source,
    };
  };

  private parseInfixExpression = (left: AST.Expression): AST.InfixExpression => {
    const source = this.captureSourceLocation();

    const precedence = this.getPrecedence(this.curToken);

    let expression: AST.Expression;
    if (this.curTokenIs(TokenKind.Backtick)) {
      this.nextToken();
      expression = this.parseIdentifier();
      this.expectPeek(TokenKind.Backtick);
    } else {
      expression = this.parseIdentifier();
    }

    this.nextToken();

    const right = this.parseExpression(precedence);

    return {
      kind: AST.ASTKind.InfixExpression,
      function: expression,
      arguments: [left, right],
      source,
    };
  };

  private parseAssignment = (left: AST.Expression): AST.AssignmentExpression => {
    if (left.kind !== AST.ASTKind.Identifier) {
      throw new ParserError(
        `Expected token to be ${TokenKind.Identifier}, but received ${left.kind}`,
        this.curToken
      );
    }

    const source = this.captureSourceLocation();

    this.nextToken();

    return {
      kind: AST.ASTKind.Assignment,
      name: left,
      value: this.parseExpression(Precedence.Lowest),
      source,
    };
  };

  private parseGroupedExpression = (): AST.Expression => {
    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest);

    this.expectPeek(TokenKind.RParen);

    return expression;
  };

  private parseCallExpression = (left: AST.Expression): AST.CallExpression => {
    if (!this.isCallable(left)) {
      throw new ParserError(
        `Invocation expected CALLABLE, but received ${left.kind}`,
        this.curToken
      );
    }

    const source = this.captureSourceLocation();

    return {
      kind: AST.ASTKind.CallExpression,
      function: left,
      arguments: this.parseExpressionList(TokenKind.RParen),
      source,
    };
  };

  private parseExpressionList(end: TokenKind): AST.Expression[] {
    if (this.peekTokenIs(end)) {
      this.nextToken();
      return [];
    }

    this.nextToken();

    const expressions: AST.Expression[] = [];

    if (this.curTokenIs(TokenKind.DotDot)) {
      const source = this.captureSourceLocation();
      this.nextToken();
      expressions.push({
        kind: AST.ASTKind.SpreadElement,
        value: this.parseExpression(Precedence.Lowest),
        source,
      });
    } else {
      expressions.push(this.parseExpression(Precedence.Lowest));
    }

    while (this.peekTokenIs(TokenKind.Comma)) {
      this.nextToken();
      this.nextToken();

      if (this.curTokenIs(TokenKind.DotDot)) {
        const source = this.captureSourceLocation();
        this.nextToken();
        expressions.push({
          kind: AST.ASTKind.SpreadElement,
          value: this.parseExpression(Precedence.Lowest),
          source,
        });
        continue;
      }

      expressions.push(this.parseExpression(Precedence.Lowest));
    }

    this.expectPeek(end);

    return expressions;
  }

  private parseIfExpression = (): AST.IfExpression => {
    const source = this.captureSourceLocation();

    this.nextToken();

    const condition = this.parseExpression(Precedence.Lowest);

    this.expectPeek(TokenKind.LBrace);

    const consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TokenKind.Else)) {
      this.nextToken();
      this.expectPeek(TokenKind.LBrace);

      return {
        kind: AST.ASTKind.IfExpression,
        condition,
        consequence,
        alternative: this.parseBlockStatement(),
        source,
      };
    }

    return {
      kind: AST.ASTKind.IfExpression,
      condition,
      consequence,
      alternative: null,
      source,
    };
  };

  private parseIndexExpression = (left: AST.Expression): AST.IndexExpression => {
    const source = this.captureSourceLocation();

    this.nextToken();

    const index = this.parseExpression(Precedence.Lowest);

    this.expectPeek(TokenKind.RBracket);

    return {
      kind: AST.ASTKind.IndexExpression,
      item: left,
      index,
      source,
    };
  };

  private parseMatchListPattern = (): AST.ListMatchPattern => {
    const source = this.captureSourceLocation();

    this.nextToken();

    if (this.curTokenIs(TokenKind.RBracket)) {
      return {
        kind: AST.ASTKind.ListMatchPattern,
        elements: [],
        source,
      };
    }

    const elements: AST.MatchPattern[] = [this.parseMatchPattern()];

    while (this.peekTokenIs(TokenKind.Comma)) {
      this.nextToken();
      this.nextToken();
      elements.push(this.parseMatchPattern());
    }

    this.expectPeek(TokenKind.RBracket);

    return {
      kind: AST.ASTKind.ListMatchPattern,
      elements,
      source,
    };
  };

  private parseMatchPattern = (): AST.MatchPattern => {
    const patterns = {
      [TokenKind.Identifier]: this.parseIdentifier,
      [TokenKind.True]: this.parseBooleon,
      [TokenKind.False]: this.parseBooleon,
      [TokenKind.Integer]: this.parseInteger,
      [TokenKind.Decimal]: this.parseDecimal,
      [TokenKind.Str]: this.parseString,
      [TokenKind.Underscore]: this.parsePlaceholder,
      [TokenKind.LBracket]: this.parseMatchListPattern,
      [TokenKind.DotDot]: () => {
        this.nextToken();
        return {
          kind: AST.ASTKind.RestElement,
          argument: {
            kind: AST.ASTKind.Identifier,
            value: this.curToken.literal,
          },
          source: this.captureSourceLocation(),
        };
      },
    };

    if (patterns[this.curToken.kind]) {
      return patterns[this.curToken.kind]();
    }

    throw new ParserError(
      `Unable to use ${this.curToken.kind} within a match pattern`,
      this.curToken
    );
  };

  private parseMatchExpression = (): AST.MatchExpression => {
    const source = this.captureSourceLocation();

    this.nextToken();

    const subject = this.parseExpression(Precedence.Lowest);

    this.expectPeek(TokenKind.LBrace);
    this.nextToken();

    const cases: AST.MatchCase[] = [];

    while (!this.curTokenIs(TokenKind.RBrace)) {
      if (this.curTokenIs(TokenKind.Comment)) {
        this.nextToken();
        continue;
      }

      const pattern = this.parseMatchPattern();

      let guard: AST.Expression | null = null;
      if (this.peekTokenIs(TokenKind.If)) {
        this.nextToken();
        this.nextToken();
        guard = this.parseExpression(Precedence.Lowest);
      }

      this.expectPeek(TokenKind.LBrace);

      const consequence = this.parseBlockStatement();

      if (this.peekTokenIs(TokenKind.Comma)) {
        this.nextToken();
      }

      this.nextToken();

      cases.push({ pattern, guard, consequence });
    }

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.MatchExpression,
      subject,
      cases,
      source,
    };
  };

  private parseIdentifier = (): AST.Identifier => ({
    kind: AST.ASTKind.Identifier,
    value: this.curToken.literal,
    source: this.captureSourceLocation(),
  });

  private parseBooleon = (): AST.Bool => ({
    kind: AST.ASTKind.Bool,
    value: this.curToken.kind === TokenKind.True,
    source: this.captureSourceLocation(),
  });

  private parseInteger = (): AST.Integer => ({
    kind: AST.ASTKind.Integer,
    value: parseInt(this.curToken.literal, 10),
    source: this.captureSourceLocation(),
  });

  private parseDecimal = (): AST.Decimal => ({
    kind: AST.ASTKind.Decimal,
    value: parseFloat(this.curToken.literal),
    source: this.captureSourceLocation(),
  });

  private parseString = (): AST.Str => ({
    kind: AST.ASTKind.Str,
    value: this.curToken.literal,
    source: this.captureSourceLocation(),
  });

  private parsePlaceholder = (): AST.Placeholder => ({
    kind: AST.ASTKind.Placeholder,
    source: this.captureSourceLocation(),
  });

  private parseNil = (): AST.Nil => ({
    kind: AST.ASTKind.Nil,
    source: this.captureSourceLocation(),
  });

  private parseComment = (): AST.CommentStatement => ({
    kind: AST.ASTKind.CommentStatement,
    value: this.curToken.literal,
    source: this.captureSourceLocation(),
  });

  private parseFunctionLiteral = (): AST.FunctionLiteral => {
    const source = this.captureSourceLocation();

    const parameters = this.curTokenIs(TokenKind.PipePipe)
      ? []
      : this.parseFunctionParameters(TokenKind.Pipe);

    this.nextToken();

    const body: AST.BlockStatement = this.curTokenIs(TokenKind.LBrace)
      ? this.parseBlockStatement()
      : {
          kind: AST.ASTKind.BlockStatement,
          statements: [this.parseExpressionStatement()],
        };

    return {
      kind: AST.ASTKind.FunctionLiteral,
      parameters,
      body,
      source,
    };
  };

  private parseHashExpression = (): AST.HashExpression => {
    const source = this.captureSourceLocation();

    const pairs: [AST.Expression, AST.Expression][] = [];

    while (!this.peekTokenIs(TokenKind.RBrace)) {
      this.nextToken();

      if (this.curToken.kind === TokenKind.Identifier && !this.peekTokenIs(TokenKind.Colon)) {
        pairs.push([this.parseString(), this.parseExpression(Precedence.Lowest)]);
        continue;
      }

      const key = this.parseExpression(Precedence.Lowest);

      this.expectPeek(TokenKind.Colon);
      this.nextToken();

      pairs.push([key, this.parseExpression(Precedence.Lowest)]);

      if (!this.peekTokenIs(TokenKind.RBrace)) {
        this.expectPeek(TokenKind.Comma);
      }
    }

    this.expectPeek(TokenKind.RBrace);

    return {
      kind: AST.ASTKind.HashExpression,
      pairs,
      source,
    };
  };

  private parseListExpression = (): AST.ListExpression => {
    const source = this.captureSourceLocation();

    return {
      kind: AST.ASTKind.ListExpression,
      elements: this.parseExpressionList(TokenKind.RBracket),
      source,
    };
  };

  private parseSetExpression = (): AST.SetExpression => {
    const source = this.captureSourceLocation();

    return {
      kind: AST.ASTKind.SetExpression,
      elements: this.parseExpressionList(TokenKind.RBrace),
      source,
    };
  };

  private parseListDestructurePattern = (): AST.ListDestructurePattern => {
    const source = this.captureSourceLocation();

    return {
      kind: AST.ASTKind.ListDestructurePattern,
      elements: this.parseFunctionParameters(TokenKind.RBracket),
      source,
    };
  };

  private parseRangeExpression = (left: AST.Expression): AST.RangeExpression => {
    if (
      !this.peekTokenIs(TokenKind.Identifier) &&
      !this.peekTokenIs(TokenKind.Integer) &&
      !this.peekTokenIs(TokenKind.Minus)
    ) {
      return {
        kind: AST.ASTKind.RangeExpression,
        start: left,
        end: {
          kind: AST.ASTKind.Integer,
          value: Infinity,
          source: this.captureSourceLocation(),
        },
        source: this.captureSourceLocation(),
      };
    }

    const source = this.captureSourceLocation();

    this.nextToken();

    return {
      kind: AST.ASTKind.RangeExpression,
      start: left,
      end: this.parseExpression(Precedence.Identifier),
      source,
    };
  };

  private parseFunctionParameters = (end: TokenKind): AST.Identifiable[] => {
    if (this.peekTokenIs(end)) {
      this.nextToken();
      return [];
    }

    this.nextToken();

    const parameters: AST.Identifiable[] = [this.parseFunctionParameter()];

    while (this.peekTokenIs(TokenKind.Comma)) {
      this.nextToken();
      this.nextToken();
      parameters.push(this.parseFunctionParameter());
    }

    this.expectPeek(end);

    return parameters;
  };

  private parseFunctionParameter = (): AST.Identifiable => {
    if (this.curTokenIs(TokenKind.LBracket)) {
      return this.parseListDestructurePattern();
    }

    if (this.curTokenIs(TokenKind.DotDot)) {
      const source = this.captureSourceLocation();
      this.nextToken();
      return {
        kind: AST.ASTKind.RestElement,
        argument: {
          kind: AST.ASTKind.Identifier,
          value: this.curToken.literal,
          source,
        },
        source,
      };
    }

    return {
      kind: AST.ASTKind.Identifier,
      value: this.curToken.literal,
      source: this.captureSourceLocation(),
    };
  };

  private parseFunctionThread = (left: AST.Expression): AST.FunctionThread => {
    const source = this.captureSourceLocation();

    const functions: AST.Callable[] = [this.parseCallable()];

    while (this.peekTokenIs(TokenKind.PipeGreater)) {
      this.nextToken();
      functions.push(this.parseCallable());
    }

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.FunctionThread,
      initial: left,
      functions,
      source,
    };
  };

  private parseFunctionComposition = (left: AST.Expression): AST.FunctionComposition => {
    if (!this.isCallable(left)) {
      throw new ParserError(`Expected callable, but received ${left.kind}`, this.curToken);
    }

    const source = this.captureSourceLocation();

    const functions: AST.Callable[] = [left, this.parseCallable()];

    while (this.peekTokenIs(TokenKind.GreaterGreater)) {
      this.nextToken();
      functions.push(this.parseCallable());
    }

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.FunctionComposition,
      functions,
      source,
    };
  };

  private parseCallable = (): AST.Callable => {
    this.nextToken();

    const result = this.parseExpression(Precedence.Identifier);

    if (!this.isCallable(result)) {
      throw new ParserError(`Expected callable, but received ${result.kind}`, this.curToken);
    }

    return result;
  };

  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private curTokenIs(token: TokenKind): boolean {
    return this.curToken.kind === token;
  }

  private peekTokenIs(token: TokenKind): boolean {
    return this.peekToken.kind === token;
  }

  private expectPeek(token: TokenKind): void {
    if (!this.peekTokenIs(token)) {
      throw new ParserError(
        `Expected next token to be ${token}, but received ${this.peekToken.kind}`,
        this.peekToken
      );
    }

    this.nextToken();
  }

  private getPrecedence(token: Token): Precedence {
    return this.expressionParser[token.kind]?.precedence || Precedence.Lowest;
  }

  private isCallable = (node: AST.Expression): node is AST.Callable =>
    node.kind === AST.ASTKind.Identifier ||
    node.kind === AST.ASTKind.FunctionLiteral ||
    node.kind === AST.ASTKind.CallExpression ||
    node.kind === AST.ASTKind.InfixExpression ||
    node.kind === AST.ASTKind.PrefixExpression ||
    node.kind === AST.ASTKind.FunctionComposition;

  private captureSourceLocation = (): AST.SourceLocation => ({
    line: this.curToken.line,
    column: this.curToken.column,
  });
}
