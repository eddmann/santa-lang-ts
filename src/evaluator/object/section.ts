import { Obj } from './type';
import { Environment } from './environment';
import { AST } from '../../parser';

export class Section implements Obj {
  constructor(
    public name: AST.Identifier,
    public section: AST.BlockStatement,
    public environment: Environment
  ) {}

  public inspect(): string {
    return `${this.name}: {…}`;
  }
}
