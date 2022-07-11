import { Obj } from './type';

export class Err implements Obj {
  constructor(public message: string) {}

  public inspect(): string {
    return `Error: ${this.message}`;
  }
}
