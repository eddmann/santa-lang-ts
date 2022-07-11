import { Obj } from './type';
import { Section } from './section';
import { Err } from './error';

export class Environment {
  sections: { [key: string]: Section[] };
  variables: { [key: string]: { value: Obj; isMutable: boolean } };
  scopedVariableNames: string[];

  constructor(public parent: Environment | null = null) {
    this.sections = {};
    this.variables = {};
    this.scopedVariableNames = this.captureParentVariableNames();
  }

  public getVariable(name: string): Obj | undefined {
    const value = this.variables[name];

    if (value) {
      return value.value;
    }

    if (this.parent && this.scopedVariableNames.includes(name)) {
      return this.parent.getVariable(name);
    }

    return undefined;
  }

  public declareVariable(name: string, value: Obj, isMutable: boolean): Obj {
    if (this.variables[name]) {
      return new Err(`Variable ${name} has already been declared`);
    }

    this.variables[name] = { value, isMutable };

    return value;
  }

  public setVariable(name: string, value: Obj): Obj {
    if (this.variables[name]) {
      if (!this.variables[name].isMutable) {
        return new Err(`Variable ${name} is not mutable`);
      }

      this.variables[name].value = value;

      return value;
    }

    if (this.parent && this.scopedVariableNames.includes(name)) {
      return this.parent.setVariable(name, value);
    }

    return new Err(`Variable ${name} has not been declared`);
  }

  public addSection(name: string, value: Section): Section {
    this.sections[name] = [...(this.sections[name] || []), value];
    return value;
  }

  public getSection(name: string): Section[] {
    return this.sections[name] || [];
  }

  public hasSection(name: string): boolean {
    return this.getSection(name).length > 0;
  }

  private captureParentVariableNames(): string[] {
    let variables: string[] = [];

    let current = this.parent;
    while (current) {
      variables = [...variables, ...Object.keys(current.variables)];
      current = current.parent;
    }

    return variables;
  }
}
