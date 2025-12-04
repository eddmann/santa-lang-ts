import { Obj } from './type';
import { Environment } from './environment';
import { AST } from '../../parser';

export class Section implements Obj {
  constructor(
    public name: AST.Identifier,
    public section: AST.BlockStatement,
    public environment: Environment,
    public attributes: AST.Attribute[] = []
  ) {}

  public hasAttribute(name: string): boolean {
    return this.attributes.some(attr => attr.name === name);
  }

  public inspect(): string {
    return `${this.name}: {…}`;
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'Section';
  }
}
