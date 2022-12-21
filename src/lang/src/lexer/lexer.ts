import { TokenKind, Token, keywords } from './token';

type SourceChar = string | null;

export default class Lexer {
  position: number = -1;
  char: SourceChar = null;
  line: number = 0;
  column: number = 0;

  constructor(private source: string) {
    this.readChar();
  }

  public nextToken(): Token {
    this.skipWhitespace();

    const token = this.parseToken();

    this.readChar();

    return token;
  }

  public readAll(): Token[] {
    const tokens: Token[] = [this.nextToken()];

    let token = tokens[0];
    while (token.kind !== TokenKind.EOF) {
      tokens.push((token = this.nextToken()));
    }

    return tokens;
  }

  private parseToken(): Token {
    switch (this.char) {
      case TokenKind.Assign:
        if (this.peekChar() === TokenKind.Assign) {
          this.readChar();
          return this.createToken(TokenKind.Equal, TokenKind.Equal);
        }

        return this.createToken(TokenKind.Assign);

      case TokenKind.Plus:
        return this.createToken(TokenKind.Plus);

      case TokenKind.Minus:
        return this.createToken(TokenKind.Minus);

      case TokenKind.Bang:
        if (this.peekChar() === TokenKind.Assign) {
          this.readChar();
          return this.createToken(TokenKind.NotEqual, TokenKind.NotEqual);
        }

        return this.createToken(TokenKind.Bang);

      case TokenKind.Asterisk:
        return this.createToken(TokenKind.Asterisk);

      case TokenKind.Slash:
        if (this.peekChar() === TokenKind.Slash) {
          this.readChar();
          return this.createToken(TokenKind.Comment, this.readComment());
        }

        return this.createToken(TokenKind.Slash);

      case TokenKind.Modulo:
        return this.createToken(TokenKind.Modulo);

      case TokenKind.LessThan:
        return this.createToken(TokenKind.LessThan);

      case TokenKind.GreaterThan:
        if (this.peekChar() === TokenKind.GreaterThan) {
          this.readChar();
          return this.createToken(TokenKind.GreaterGreater, TokenKind.GreaterGreater);
        }

        return this.createToken(TokenKind.GreaterThan);

      case TokenKind.Comma:
        return this.createToken(TokenKind.Comma);

      case TokenKind.Semicolon:
        return this.createToken(TokenKind.Semicolon);

      case TokenKind.Colon:
        return this.createToken(TokenKind.Colon);

      case TokenKind.LParen:
        return this.createToken(TokenKind.LParen);

      case TokenKind.RParen:
        return this.createToken(TokenKind.RParen);

      case TokenKind.LBrace:
        return this.createToken(TokenKind.LBrace);

      case TokenKind.RBrace:
        return this.createToken(TokenKind.RBrace);

      case TokenKind.Hash:
        if (this.peekChar() === TokenKind.LBrace) {
          this.readChar();
          return this.createToken(TokenKind.HashLBrace, TokenKind.HashLBrace);
        }

        return this.createToken(TokenKind.Hash);

      case TokenKind.LBracket:
        return this.createToken(TokenKind.LBracket);

      case TokenKind.RBracket:
        return this.createToken(TokenKind.RBracket);

      case TokenKind.Underscore:
        return this.createToken(TokenKind.Underscore);

      case TokenKind.Dot:
        if (this.peekChar() === TokenKind.Dot) {
          this.readChar();
          return this.createToken(TokenKind.DotDot, TokenKind.DotDot);
        }

        return this.createToken(TokenKind.Dot);

      case TokenKind.Backtick:
        return this.createToken(TokenKind.Backtick);

      case TokenKind.Pipe:
        if (this.peekChar() === TokenKind.Pipe) {
          this.readChar();
          return this.createToken(TokenKind.PipePipe, TokenKind.PipePipe);
        }

        if (this.peekChar() === TokenKind.GreaterThan) {
          this.readChar();
          return this.createToken(TokenKind.PipeGreater, TokenKind.PipeGreater);
        }

        return this.createToken(TokenKind.Pipe);

      case TokenKind.Amp:
        if (this.peekChar() === TokenKind.Amp) {
          this.readChar();
          return this.createToken(TokenKind.AmpAmp, TokenKind.AmpAmp);
        }

        return this.createToken(TokenKind.Amp);

      case '"':
        return this.createToken(TokenKind.Str, this.readString());

      case null:
        return this.createToken(TokenKind.EOF, '');

      default:
        if (this.isLetter(this.char)) {
          const identifier = this.readIdentifier();

          return this.createToken(keywords[identifier] || TokenKind.Identifier, identifier);
        }

        if (this.isDigit(this.char)) {
          return this.readNumberToken();
        }

        return this.createToken(TokenKind.Illegal);
    }
  }

  private createToken(kind: TokenKind, multiLiteral: string | null = null): Token {
    const literal = multiLiteral === null ? this.char || '' : multiLiteral;

    return {
      kind,
      literal,
      line: this.line,
      column: this.column - literal.length,
    };
  }

  private readIdentifier(): string {
    let literal = this.char || '';

    while (this.isLetterOrDigit(this.peekChar())) {
      this.readChar();
      literal += this.char;
    }

    return literal;
  }

  private readString(): string {
    this.readChar();

    let str = '';

    while (this.char && this.char !== '"') {
      str += this.char === '\\' ? this.readEscapeChar() : this.char;
      this.readChar();
    }

    return str;
  }

  private readEscapeChar(): string {
    this.readChar();

    switch (this.char) {
      case 'b':
        return '\b';
      case 'f':
        return '\f';
      case 'r':
        return '\r';
      case 'n':
        return '\n';
      case 't':
        return '\t';
      case '\\':
        return '\\';
      case '"':
        return '"';
      default:
        throw new Error('Invalid escape character');
    }
  }

  private readNumberToken(): Token {
    const startPosition = this.position;
    let isDecimal = false;

    while (
      this.isDigit(this.peekChar()) ||
      this.peekChar() === TokenKind.Dot ||
      this.peekChar() === TokenKind.Underscore
    ) {
      if (this.char === TokenKind.Dot) {
        if (this.peekChar() == TokenKind.Dot) {
          this.position -= 1;
          return this.createToken(
            TokenKind.Integer,
            this.source.slice(startPosition, this.position + 1)
          );
        }

        isDecimal = true;
      }

      this.readChar();
    }

    return this.createToken(
      isDecimal ? TokenKind.Decimal : TokenKind.Integer,
      this.source.slice(startPosition, this.position + 1).replace(TokenKind.Underscore, '')
    );
  }

  private readComment(): string {
    this.readChar();

    const startPosition = this.position;

    while (this.peekChar() && this.peekChar() !== '\n' && this.peekChar() !== '\r') {
      this.readChar();
    }

    return this.source.slice(startPosition, this.position + 1);
  }

  private readChar(): void {
    const nextPosition = this.position + 1;

    if (nextPosition >= this.source.length) {
      this.char = null;
      return;
    }

    this.char = this.source[nextPosition];
    this.position = nextPosition;
    this.column += 1;

    if (this.char === '\n' || this.char === '\r') {
      this.line += 1;
      this.column = 0;
    }
  }

  private isLetter = (char: SourceChar): boolean =>
    char !== null && 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char);

  private isLetterOrDigit = (char: SourceChar): boolean =>
    char !== null &&
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!'.includes(char);

  private isDigit = (char: SourceChar): boolean => char !== null && '0123456789'.includes(char);

  private peekChar(): SourceChar {
    const nextPosition = this.position + 1;
    return nextPosition < this.source.length ? this.source[nextPosition] : null;
  }

  private skipWhitespace(): void {
    while (this.char === ' ' || this.char === '\t' || this.char === '\n' || this.char === '\r') {
      this.readChar();
    }
  }
}
