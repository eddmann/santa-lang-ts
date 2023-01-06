import { AST } from '../../parser';
import { Obj } from './type';

export class Err implements Obj {
  constructor(public message: string, public node: AST.Node) {}

  public inspect(): string {
    return `Runtime error: ${this.message}`;
  }

  public isTruthy(): boolean {
    return true;
  }
}
