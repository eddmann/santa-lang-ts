import Immutable from 'immutable';
import { ValueObj, Obj } from './type';
import { Environment } from './environment';
import { AST } from '../../parser';

export class Func implements Obj {
  constructor(
    public parameters: AST.Identifiable[],
    public body: AST.BlockStatement,
    public environment: Environment
  ) {}

  public inspect(): string {
    const parameters = this.parameters.map(parameter => parameter.value).join(', ');
    return `|${parameters}| {…}`;
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'Function';
  }
}

export type BuiltinFuncTemplate = {
  parameters: AST.Identifiable[];
  body: (environment: Environment) => Obj;
};

export class BuiltinFunc implements Obj {
  constructor(
    public parameters: AST.Identifiable[],
    public body: (environment: Environment) => Obj,
    public environment: Environment
  ) {}

  public inspect(): string {
    const parameters = this.parameters.map(parameter => parameter.value).join(', ');
    return `|${parameters}| {…}`;
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'BuiltinFn';
  }
}

export class TailCallFunc implements Obj {
  constructor(
    public parameters: AST.Identifiable[],
    public body: AST.BlockStatement,
    public environment: Environment
  ) {}

  public inspect(): string {
    const parameters = this.parameters.map(parameter => parameter.value).join(', ');
    return `|${parameters}| {…}`;
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'TailCallFn';
  }
}

export class ReturnValue implements Obj {
  constructor(public value: Obj) {}

  public inspect(): string {
    return this.value.inspect();
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'ReturnValue';
  }
}

export class BreakValue implements Obj {
  constructor(public value: Obj) {}

  public inspect(): string {
    return this.value.inspect();
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'Break';
  }
}

export class Placeholder implements ValueObj {
  public inspect(): string {
    return '_';
  }

  public hashCode(): number {
    return Immutable.hash('_');
  }

  public equals(that: Obj): boolean {
    return that instanceof Placeholder;
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'Placeholder';
  }
}

export const PLACEHOLDER = new Placeholder();
