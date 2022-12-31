import Immutable from 'immutable';
import { Range, List } from './collection';
import { ValueObj, Obj } from './type';
import { Err } from './error';
import { BreakValue } from './function';

export class Bool implements ValueObj {
  constructor(public value: boolean) {}

  public static parse(value: Obj): Bool {
    if (value instanceof Bool) {
      return value;
    }

    if (value instanceof Str) {
      return new Bool(value.value !== '');
    }

    if (value instanceof Integer) {
      return new Bool(value.value !== 0);
    }

    if (value instanceof Decimal) {
      return new Bool(value.value !== 0.0);
    }

    return new Bool(value !== FALSE && value !== NIL);
  }

  public inspect(): string {
    return this.value.toString();
  }

  public hashCode(): number {
    return Immutable.hash(this.value);
  }

  public equals(that: Obj): boolean {
    return that instanceof Bool && this.value === that.value;
  }

  public not(): Bool {
    return this.value ? FALSE : TRUE;
  }
}

export class Nil implements ValueObj {
  public inspect(): string {
    return 'nil';
  }

  public hashCode(): number {
    return Immutable.hash(null);
  }

  public equals(that: Obj): boolean {
    return that instanceof Nil;
  }
}

export class Integer implements ValueObj {
  constructor(public value: number) {}

  public static parse(value: Obj): Integer {
    if (value instanceof Bool) {
      return new Integer(value === TRUE ? 1 : 0);
    }

    if (value instanceof Integer) {
      return value;
    }

    if (value instanceof Decimal) {
      return new Integer(Math.floor(value.value));
    }

    if (value instanceof Str) {
      if (value.value === '') {
        return new Integer(0);
      }

      return new Integer(parseInt(value.value, 10));
    }

    throw new Error(
      `Parsing ${value.constructor.name} as a ${this.constructor.name} is not supported`
    );
  }

  public bitAnd(value: Obj): Integer {
    if (!(value instanceof Integer)) {
      throw new Error('Operation only permitted for Integer values');
    }

    return new Integer(this.value & value.value);
  }

  public bitOr(value: Obj): Integer {
    if (!(value instanceof Integer)) {
      throw new Error('Operation only permitted for Integer values');
    }

    return new Integer(this.value | value.value);
  }

  public bitXor(value: Obj): Integer {
    if (!(value instanceof Integer)) {
      throw new Error('Operation only permitted for Integer values');
    }

    return new Integer(this.value ^ value.value);
  }

  public bitShiftLeft(value: Obj): Integer {
    if (!(value instanceof Integer)) {
      throw new Error('Operation only permitted for Integer values');
    }

    return new Integer(this.value << value.value);
  }

  public bitShiftRight(value: Obj): Integer {
    if (!(value instanceof Integer)) {
      throw new Error('Operation only permitted for Integer values');
    }

    return new Integer(this.value >> value.value);
  }

  public inspect(): string {
    return this.value.toString();
  }

  public hashCode(): number {
    return Immutable.hash(this.value);
  }

  public equals(that: Obj): boolean {
    return that instanceof Integer && this.value === that.value;
  }

  public add(that: Obj): Integer {
    if (that instanceof Integer) {
      return new Integer(this.value + that.value);
    }

    if (that instanceof Decimal) {
      return new Integer(Math.floor(this.value + that.value));
    }

    throw new Error(`${this.constructor.name} + ${that.constructor.name} is not supported`);
  }

  public subtract(that: Obj): Integer {
    if (that instanceof Integer) {
      return new Integer(this.value - that.value);
    }

    if (that instanceof Decimal) {
      return new Integer(Math.floor(this.value - that.value));
    }

    throw new Error(`${this.constructor.name} - ${that.constructor.name} is not supported`);
  }

  public multiply(that: Obj): Integer {
    if (that instanceof Integer) {
      return new Integer(this.value * that.value);
    }

    if (that instanceof Decimal) {
      return new Integer(Math.floor(this.value * that.value));
    }

    throw new Error(`${this.constructor.name} * ${that.constructor.name} is not supported`);
  }

  public divide(that: Obj): Integer {
    if (that instanceof Integer) {
      return new Integer(Math.floor(this.value / that.value));
    }

    if (that instanceof Decimal) {
      return new Integer(Math.floor(this.value / that.value));
    }

    throw new Error(`${this.constructor.name} / ${that.constructor.name} is not supported`);
  }

  public modulo(that: Obj): Integer {
    if (that instanceof Integer) {
      return new Integer(this.value % that.value);
    }

    if (that instanceof Decimal) {
      return new Integer(Math.floor(this.value % that.value));
    }

    throw new Error(`${this.constructor.name} % ${that.constructor.name} is not supported`);
  }

  public lessThan(that: Obj): Bool {
    if (that instanceof Integer) {
      return this.value < that.value ? TRUE : FALSE;
    }

    if (that instanceof Decimal) {
      return this.value < that.value ? TRUE : FALSE;
    }

    throw new Error(`${this.constructor.name} < ${that.constructor.name} is not supported`);
  }

  public lessThanEqual(that: Obj): Bool {
    return this.lessThan(that) == TRUE ? TRUE : this.equals(that) ? TRUE : FALSE;
  }

  public greaterThan(that: Obj): Bool {
    if (that instanceof Integer) {
      return this.value > that.value ? TRUE : FALSE;
    }

    if (that instanceof Decimal) {
      return this.value > that.value ? TRUE : FALSE;
    }

    throw new Error(`${this.constructor.name} > ${that.constructor.name} is not supported`);
  }

  public greaterThanEqual(that: Obj): Bool {
    return this.greaterThan(that) == TRUE ? TRUE : this.equals(that) ? TRUE : FALSE;
  }

  public negative(): Integer {
    return new Integer(-this.value);
  }

  public abs(): Integer {
    return new Integer(Math.abs(this.value));
  }
}

export class Decimal implements ValueObj {
  constructor(public value: number) {}

  public static parse(value: Obj): Decimal {
    if (value instanceof Bool) {
      return new Decimal(value === TRUE ? 1 : 0);
    }

    if (value instanceof Decimal) {
      return value;
    }

    if (value instanceof Integer) {
      return new Integer(value.value);
    }

    if (value instanceof Str) {
      if (value.value === '') {
        return new Decimal(0);
      }

      return new Decimal(parseFloat(value.value));
    }

    throw new Error(
      `Parsing ${value.constructor.name} as a ${this.constructor.name} is not supported`
    );
  }

  public inspect(): string {
    return this.value.toString();
  }

  public hashCode(): number {
    return Immutable.hash(this.value);
  }

  public equals(that: Obj): boolean {
    return that instanceof Decimal && this.value === that.value;
  }

  public add(that: Obj): Decimal {
    if (that instanceof Integer) {
      return new Decimal(this.value + that.value);
    }

    if (that instanceof Decimal) {
      return new Decimal(this.value + that.value);
    }

    throw new Error(`${this.constructor.name} + ${that.constructor.name} is not supported`);
  }

  public subtract(that: Obj): Decimal {
    if (that instanceof Integer) {
      return new Decimal(this.value - that.value);
    }

    if (that instanceof Decimal) {
      return new Decimal(this.value - that.value);
    }

    throw new Error(`${this.constructor.name} / ${that.constructor.name} is not supported`);
  }

  public multiply(that: Obj): Decimal {
    if (that instanceof Integer) {
      return new Decimal(this.value * that.value);
    }

    if (that instanceof Decimal) {
      return new Decimal(this.value * that.value);
    }

    throw new Error(`${this.constructor.name} * ${that.constructor.name} is not supported`);
  }

  public divide(that: Obj): Decimal {
    if (that instanceof Integer) {
      return new Decimal(this.value / that.value);
    }

    if (that instanceof Decimal) {
      return new Decimal(this.value / that.value);
    }

    throw new Error(`${this.constructor.name} / ${that.constructor.name} is not supported`);
  }

  public modulo(that: Obj): Decimal {
    if (that instanceof Integer) {
      return new Decimal(this.value % that.value);
    }

    if (that instanceof Decimal) {
      return new Decimal(this.value % that.value);
    }

    throw new Error(`${this.constructor.name} % ${that.constructor.name} is not supported`);
  }

  public lessThan(that: Obj): Bool {
    if (that instanceof Integer) {
      return this.value < that.value ? TRUE : FALSE;
    }

    if (that instanceof Decimal) {
      return this.value < that.value ? TRUE : FALSE;
    }

    throw new Error(`${this.constructor.name} < ${that.constructor.name} is not supported`);
  }

  public lessThanEqual(that: Obj): Bool {
    return this.lessThan(that) == TRUE ? TRUE : this.equals(that) ? TRUE : FALSE;
  }

  public greaterThan(that: Obj): Bool {
    if (that instanceof Integer) {
      return this.value > that.value ? TRUE : FALSE;
    }

    if (that instanceof Decimal) {
      return this.value > that.value ? TRUE : FALSE;
    }

    throw new Error(`${this.constructor.name} > ${that.constructor.name} is not supported`);
  }

  public greaterThanEqual(that: Obj): Bool {
    return this.greaterThan(that) == TRUE ? TRUE : this.equals(that) ? TRUE : FALSE;
  }

  public negative(): Decimal {
    return new Decimal(-this.value);
  }

  public abs(): Decimal {
    return new Decimal(Math.abs(this.value));
  }
}

export class Str implements ValueObj {
  constructor(public value: string) {}

  public static parse(value: Obj): Str {
    if (value instanceof Str) {
      return value;
    }

    return new Str(value.inspect());
  }

  public inspect(): string {
    return `"${this.value}"`;
  }

  public hashCode(): number {
    return Immutable.hash(this.value);
  }

  public equals(that: Obj): boolean {
    return that instanceof Str && this.value === that.value;
  }

  public get(index: Obj): Obj {
    if (index instanceof Integer) {
      const char = this.value[index.value < 0 ? this.value.length + index.value : index.value];

      return char !== undefined ? new Str(char) : NIL;
    }

    if (index instanceof Range) {
      if (index.end < 0) {
        return new Str(this.value.substring(index.start, this.value.length + index.end));
      }

      if (index.start < 0) {
        return new Str(this.value.substring(this.value.length + index.start, index.end + 1));
      }

      return new Str(this.value.substring(index.start, index.end + 1));
    }

    throw new Error(`${this.constructor.name}[${index.constructor.name}] is not supported`);
  }

  public size(): Err | Integer {
    return new Integer(this.value.length);
  }

  public contains(subject: Obj): Bool {
    return subject instanceof Str && this.value.includes(subject.value) ? TRUE : FALSE;
  }

  public first(): Obj | Nil {
    return new Str(this.value[0] || '');
  }

  public rest(): Str {
    return new Str(this.value.substring(1));
  }

  public last(): Obj | Nil {
    return new Str(this.value[this.value.length - 1] || '');
  }

  public take(total: Integer): Str {
    return new Str(this.value.substring(0, total.value));
  }

  public skip(total: Integer): Str {
    return new Str(this.value.substring(total.value));
  }

  public find(fn: (v: Obj) => Obj): Obj {
    try {
      const result = this.getInteralSeq().find(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        return result !== FALSE && result !== NIL;
      });

      return result !== undefined ? result : NIL;
    } catch (err) {
      return err;
    }
  }

  public zip(collections: List): List {
    return new List(
      this.getInteralSeq().zipWith(
        (...values) => new List(values),
        ...collections.getInteralSeq().map(collection => collection.getInteralSeq())
      )
    );
  }

  public getInteralSeq(): Immutable.Seq {
    return Immutable.List([...this.value]).map(v => new Str(v));
  }

  public chunk(size: Integer): List {
    const chars = this.getInteralSeq();

    return new List(
      Immutable.Range(0, chars.count(), size.value)
        .map(start => new List(chars.slice(start, start + size.value)))
        .toList()
    );
  }

  public map(fn: (v: Obj) => Obj | Err): List {
    try {
      return new List(
        this.getInteralSeq().map(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result;
        })
      );
    } catch (err) {
      return err;
    }
  }

  public filter(fn: (v: Obj) => Obj): List {
    try {
      return new List(
        this.getInteralSeq().filter(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result !== FALSE && result !== NIL;
        })
      );
    } catch (err) {
      return err;
    }
  }

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
    try {
      return this.getInteralSeq().reduce((acc, v) => {
        const result = fn(acc, v);

        if (result instanceof Err) {
          throw result;
        }

        if (result instanceof BreakValue) {
          throw result.value;
        }

        return result;
      }, initial);
    } catch (err) {
      return err;
    }
  }

  public each(fn: (v: Obj) => Nil | Err): Nil {
    try {
      this.getInteralSeq().forEach(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        if (result instanceof BreakValue) {
          throw NIL;
        }
      });

      return NIL;
    } catch (err) {
      return err;
    }
  }

  public add(that: Obj): Str {
    const parsed = Str.parse(that);

    return new Str(this.value + parsed.value);
  }

  public lessThan(that: Obj): Bool {
    if (that instanceof Str) {
      return this.value.localeCompare(that.value) < 0 ? TRUE : FALSE;
    }

    throw new Error(`${this.constructor.name} < ${that.constructor.name} is not supported`);
  }

  public greaterThan(that: Obj): Bool {
    if (that instanceof Str) {
      return this.value.localeCompare(that.value) > 0 ? TRUE : FALSE;
    }

    throw new Error(`${this.constructor.name} > ${that.constructor.name} is not supported`);
  }

  public split(delimiter: Obj): List {
    if (delimiter instanceof Str) {
      return new List(this.value.split(delimiter.value).map(v => new Str(v)));
    }

    throw new Error(
      `split(${delimiter.constructor.name}, ${this.constructor.name}) is not supported`
    );
  }

  public regExMatch(pattern: Obj): List {
    if (!(pattern instanceof Str)) {
      throw new Error(
        `regex_match(${pattern.constructor.name}, ${this.constructor.name}) is not supported`
      );
    }

    const match = this.value.match(new RegExp(pattern.value));

    return new List((match || []).slice(1).map(v => new Str(v)));
  }

  public regExMatchAll(pattern: Obj): List {
    if (!(pattern instanceof Str)) {
      throw new Error(
        `regex_match_all(${pattern.constructor.name}, ${this.constructor.name}) is not supported`
      );
    }

    const match = this.value.match(new RegExp(pattern.value, 'g'));

    return new List((match || []).map(v => new Str(v)));
  }

  public parseInts(): List {
    const match = this.value.match(new RegExp('(-?[0-9]+)', 'g'));

    return new List((match || []).map(v => new Integer(parseInt(v, 10))));
  }

  public toUpper(): Str {
    return new Str(this.value.toUpperCase());
  }

  public toLower(): Str {
    return new Str(this.value.toLowerCase());
  }

  public replace(subject: Str, replacement: Str): Str {
    return new Str(this.value.replace(new RegExp(subject.value, 'g'), replacement.value));
  }

  public isImmutable(): boolean {
    return true;
  }
}

export const TRUE = new Bool(true);
export const FALSE = new Bool(false);
export const NIL = new Nil();
