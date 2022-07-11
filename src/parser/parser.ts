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
  constructor(message: string, public token: TokenKind) {
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
      [TokenKind.DotDot]: {
        precedence: Precedence.Sum,
        prefix: this.parseIdentifier,
        infix: this.parseRangeLiteral,
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
      [TokenKind.HashLBrace]: { precedence: Precedence.Lowest, prefix: this.parseHashLiteral },
      [TokenKind.LBrace]: { precedence: Precedence.Lowest, prefix: this.parseSetLiteral },
      [TokenKind.LBracket]: {
        precedence: Precedence.Index,
        prefix: this.parseListLiteral,
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

  parse(): AST.Program {
    const statements: AST.Statement[] = [];

    while (this.curToken.kind !== TokenKind.EOF) {
      statements.push(this.parseStatement());
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Program,
      statements,
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
      case TokenKind.Identifier:
        if (this.peekTokenIs(TokenKind.Colon)) {
          return this.parseSectionStatement();
        }
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): AST.LetStatement | AST.LetListDestructureStatement {
    const isMutable = this.peekTokenIs(TokenKind.Mutable);
    if (isMutable) {
      this.nextToken();
    }

    if (this.peekTokenIs(TokenKind.Identifier)) {
      this.nextToken();

      const name: AST.Identifier = {
        kind: AST.ASTKind.Identifier,
        value: this.curToken.literal,
      };

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
      };
    }

    this.expectPeek(TokenKind.LBracket);

    const names = this.parseFunctionParameters(TokenKind.RBracket);

    this.expectPeek(TokenKind.Assign);
    this.nextToken();

    const value = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.LetListDestructure,
      names,
      value,
      isMutable,
    };
  }

  private parseAssignment = (left: AST.Expression): AST.AssignmentExpression => {
    if (left.kind !== AST.ASTKind.Identifier) {
      throw new ParserError(
        `Expected assignment to be an identifier, but received ${left.kind}`,
        this.curToken
      );
    }

    this.nextToken();

    return {
      kind: AST.ASTKind.Assignment,
      name: left,
      value: this.parseExpression(Precedence.Lowest),
    };
  };

  private parseReturnStatement(): AST.ReturnStatment {
    this.nextToken();

    const returnValue = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Return,
      returnValue,
    };
  }

  private parseBreakStatement(): AST.BreakStatment {
    this.nextToken();

    const value =
      this.expressionParser[this.curToken.kind] && this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.Break,
      value,
    };
  }

  private parseSectionStatement(): AST.SectionStatement {
    const name = this.parseIdentifier();

    this.nextToken();
    this.nextToken();

    if (this.curTokenIs(TokenKind.LBrace)) {
      const section = this.parseBlockStatement();

      if (this.peekTokenIs(TokenKind.Semicolon)) {
        this.nextToken();
      }

      return {
        kind: AST.ASTKind.Section,
        name,
        section,
      };
    }

    return {
      kind: AST.ASTKind.Section,
      name,
      section: {
        kind: AST.ASTKind.BlockStatement,
        statements: [this.parseExpressionStatement()],
      },
    };
  }

  private parseBlockStatement(): AST.BlockStatement {
    const statements: AST.Statement[] = [];

    this.nextToken();

    while (!this.curTokenIs(TokenKind.RBrace) && !this.curTokenIs(TokenKind.EOF)) {
      statements.push(this.parseStatement());
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.BlockStatement,
      statements,
    };
  }

  private parseExpressionStatement(): AST.ExpressionStatement {
    const expression = this.parseExpression(Precedence.Lowest);

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.ExpressionStatement,
      expression,
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
    const expression = this.parseIdentifier();

    this.nextToken();

    return {
      kind: AST.ASTKind.PrefixExpression,
      function: {
        kind: AST.ASTKind.Identifier,
        value: `unary_${expression.value}`,
      },
      argument: this.parseExpression(Precedence.Prefix),
    };
  };

  private parseInfixExpression = (left: AST.Expression): AST.InfixExpression => {
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
        `Invocation expected callable, but received ${left.kind}`,
        this.curToken
      );
    }

    return {
      kind: AST.ASTKind.CallExpression,
      function: left,
      arguments: this.parseExpressionList(TokenKind.RParen),
    };
  };

  private parseExpressionList(end: TokenKind): AST.Expression[] {
    const list: AST.Expression[] = [];

    if (this.peekTokenIs(end)) {
      this.nextToken();
      return list;
    }

    this.nextToken();

    if (this.curTokenIs(TokenKind.DotDot)) {
      this.nextToken();
      const xs = this.parseExpression(Precedence.Lowest);
      list.push({ kind: AST.ASTKind.IdentifierGlob, value: xs.value });
    } else {
      list.push(this.parseExpression(Precedence.Lowest));
    }

    while (this.peekTokenIs(TokenKind.Comma)) {
      this.nextToken();
      this.nextToken();

      if (this.curTokenIs(TokenKind.DotDot)) {
        this.nextToken();
        const xs = this.parseExpression(Precedence.Lowest);
        list.push({ kind: AST.ASTKind.IdentifierGlob, value: xs.value });
        continue;
      }

      list.push(this.parseExpression(Precedence.Lowest));
    }

    this.expectPeek(end);

    return list;
  }

  private parseIfExpression = (): AST.IfExpression => {
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
      };
    }

    return {
      kind: AST.ASTKind.IfExpression,
      condition,
      consequence,
      alternative: undefined,
    };
  };

  private parseIndexExpression = (left: AST.Expression): AST.IndexExpression => {
    this.nextToken();

    const index = this.parseExpression(Precedence.Lowest);

    this.expectPeek(TokenKind.RBracket);

    return {
      kind: AST.ASTKind.IndexExpression,
      item: left,
      index,
    };
  };

  private parseMatchExpression = (): AST.MatchExpression => {
    this.nextToken();

    const subject = this.parseExpression(Precedence.Lowest);

    this.expectPeek(TokenKind.LBrace);
    this.nextToken();

    const cases: AST.MatchCase[] = [];

    while (!this.curTokenIs(TokenKind.RBrace)) {
      const pattern = this.parseExpression(Precedence.Lowest);

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
    };
  };

  private parseIdentifier = (): AST.Identifier => {
    return {
      kind: AST.ASTKind.Identifier,
      value: this.curToken.literal,
    };
  };

  private parseBooleon = (): AST.Bool => ({
    kind: AST.ASTKind.Bool,
    value: this.curToken.kind === TokenKind.True,
  });

  private parseInteger = (): AST.Integer => ({
    kind: AST.ASTKind.Integer,
    value: parseInt(this.curToken.literal, 10),
  });

  private parseDecimal = (): AST.Decimal => ({
    kind: AST.ASTKind.Decimal,
    value: parseFloat(this.curToken.literal),
  });

  private parseString = (): AST.Str => ({
    kind: AST.ASTKind.Str,
    value: this.curToken.literal,
  });

  private parsePlaceholder = (): AST.Placeholder => ({
    kind: AST.ASTKind.Placeholder,
  });

  private parseFunctionLiteral = (): AST.FunctionLiteral => {
    const parameters = this.curTokenIs(TokenKind.PipePipe)
      ? []
      : this.parseFunctionParameters(TokenKind.Pipe);

    if (this.peekTokenIs(TokenKind.LBrace)) {
      this.nextToken();
      const body = this.parseBlockStatement();

      return {
        kind: AST.ASTKind.FunctionLiteral,
        parameters,
        body,
      };
    }

    this.nextToken();

    return {
      kind: AST.ASTKind.FunctionLiteral,
      parameters,
      body: {
        kind: AST.ASTKind.BlockStatement,
        statements: [this.parseExpressionStatement()],
      },
    };
  };

  private parseHashLiteral = (): AST.HashLiteral => {
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
      kind: AST.ASTKind.HashLiteral,
      pairs,
    };
  };

  private parseListLiteral = (): AST.ListLiteral => ({
    kind: AST.ASTKind.ListLiteral,
    elements: this.parseExpressionList(TokenKind.RBracket),
  });

  private parseSetLiteral = (): AST.SetLiteral => ({
    kind: AST.ASTKind.SetLiteral,
    elements: this.parseExpressionList(TokenKind.RBrace),
  });

  private parseRangeLiteral = (left: AST.Expression): AST.RangeLiteral => {
    if (
      !this.peekTokenIs(TokenKind.Identifier) &&
      !this.peekTokenIs(TokenKind.Integer) &&
      !this.peekTokenIs(TokenKind.Minus)
    ) {
      return {
        kind: AST.ASTKind.RangeLiteral,
        start: left,
        end: {
          kind: AST.ASTKind.Integer,
          value: Infinity,
        },
      };
    }

    this.nextToken();

    return {
      kind: AST.ASTKind.RangeLiteral,
      start: left,
      end: this.parseExpression(Precedence.Identifier),
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

  private parseFunctionThread = (left: AST.Expression): AST.FunctionThread => {
    const functions: AST.Callable[] = [this.parseFunctionChain()];

    while (this.peekTokenIs(TokenKind.PipeGreater)) {
      this.nextToken();
      functions.push(this.parseFunctionChain());
    }

    return {
      kind: AST.ASTKind.FunctionThread,
      initial: left,
      functions,
    };
  };

  private parseFunctionParameter = (): AST.Identifiable => {
    if (this.curTokenIs(TokenKind.LBracket)) {
      const values = this.parseFunctionParameters(TokenKind.RBracket);
      return {
        kind: AST.ASTKind.IdentifierListDestructure,
        values,
      };
    }

    if (this.curTokenIs(TokenKind.DotDot)) {
      this.nextToken();
      return {
        kind: AST.ASTKind.IdentifierGlob,
        value: this.curToken.literal,
      };
    }

    return {
      kind: AST.ASTKind.Identifier,
      value: this.curToken.literal,
    };
  };

  private parseFunctionComposition = (left: AST.Expression): AST.FunctionComposition => {
    if (!this.isCallable(left)) {
      throw new ParserError(
        `Function composition expected callable, but received ${left.kind}`,
        this.curToken
      );
    }

    const functions: AST.Callable[] = [left, this.parseFunctionChain()];

    while (this.peekTokenIs(TokenKind.GreaterGreater)) {
      this.nextToken();
      functions.push(this.parseFunctionChain());
    }

    if (this.peekTokenIs(TokenKind.Semicolon)) {
      this.nextToken();
    }

    return {
      kind: AST.ASTKind.FunctionComposition,
      functions,
    };
  };

  private parseFunctionChain = (): AST.Callable => {
    this.nextToken();

    const result = this.parseExpression(Precedence.Identifier);

    if (!this.isCallable(result)) {
      throw new ParserError(
        `Function composition expected callable, but received ${result.kind}`,
        this.curToken
      );
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
}
