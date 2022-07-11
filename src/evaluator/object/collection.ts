import Immutable from 'immutable';
import { ValueObj, Obj } from './type';
import { Err } from './error';
import { BreakValue } from './function';
import { Integer, Bool, Nil, TRUE, FALSE, NIL } from './primitive';

export class List implements ValueObj {
  public items: Immutable.List<Obj>;

  constructor(items: Iterable<Obj> | ArrayLike<Obj>) {
    this.items = Immutable.List(items);
  }

  public inspect(): string {
    return '[' + this.items.map(item => item.inspect()).join(', ') + ']';
  }

  public hashCode(): number {
    return this.items.hashCode();
  }

  public equals(that: Obj): boolean {
    return that instanceof List && this.items.equals(that.items);
  }

  public get(index: Obj): Obj | Err {
    if (index instanceof Integer) {
      return this.items.get(index.value) || NIL;
    }

    if (index instanceof Range) {
      return new List(this.items.slice(index.start, index.end));
    }

    return new Err(
      `Unsupported 'get' operation ${this.constructor.name}, ${index.constructor.name}`
    );
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool | Err {
    return this.items.contains(subject) ? TRUE : FALSE;
  }

  public first(): Obj | Nil | Err {
    return this.items.first() || NIL;
  }

  public rest(): List | Err {
    return new List(this.items.rest());
  }

  public last(): Obj | Nil | Err {
    return this.items.last() || NIL;
  }

  public take(total: Integer): List | Err {
    return new List(this.items.take(total.value));
  }

  public skip(total: Integer): List | Err {
    return new List(this.items.skip(total.value));
  }

  public find(fn: (v: Obj) => Obj): Obj {
    try {
      const result = this.items.find(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        return result !== FALSE && result !== NIL;
      });

      return result || NIL;
    } catch (err) {
      return err;
    }
  }

  public zip(collections: List): List | Err {
    return new List(
      this.items.zipWith(
        (...values) => new List(values),
        ...collections.getInteralSeq().map(collection => collection.getInteralSeq())
      )
    );
  }

  public map(fn: (v: Obj) => Obj | Err): List | Err {
    try {
      return new List(
        this.items.map(v => {
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

  public filter(fn: (v: Obj) => Obj): List | Err {
    try {
      return new List(
        this.items.filter(v => {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj | Err {
    try {
      return this.items.reduce((acc, v) => {
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

  public each(fn: (v: Obj) => Nil | Err): Nil | Err {
    try {
      this.items.forEach(v => {
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

  public add(that: Obj): List | Err {
    if (that instanceof List) {
      return new List(this.items.concat(that.items));
    }

    return new Err('');
  }

  public subtract(that: Obj): List | Err {
    if (that instanceof List) {
      return new List(this.items.filter(item => !that.items.contains(item)));
    }

    return new Err('');
  }

  public multiply(that: Obj): List | Err {
    if (that instanceof Integer) {
      const items = this.items.asMutable();

      let remaining = that.value;
      while (--remaining) {
        items.concat(this.items);
      }

      return new List(items.asImmutable());
    }

    return new Err('');
  }

  public chunk(size: Integer): List | Err {
    return new List(
      Immutable.Range(0, this.items.count(), size.value)
        .map(start => new List(this.items.slice(start, start + size.value)))
        .toList()
    );
  }

  public getInteralSeq(): Immutable.Seq {
    return this.items;
  }
}

export class Hash {
  private items: Immutable.Map<Obj, Obj>;

  constructor(items: Iterable<[Obj, Obj]>) {
    this.items = Immutable.Map(items);
  }

  public inspect(): string {
    return (
      '#{' +
      [...this.items.entries()]
        .map(([key, value]) => `${key.inspect()}: ${value.inspect()}`)
        .join(', ') +
      '}'
    );
  }

  public hashCode(): number {
    return this.items.hashCode();
  }

  public equals(that: Obj): boolean {
    return that instanceof Hash && this.items.equals(that.items);
  }

  public get(index: Obj): Obj | Err {
    return this.items.get(index) || NIL;
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool | Err {
    return this.items.contains(subject) ? TRUE : FALSE;
  }

  public find(fn: (v: Obj, k: Obj) => Obj): Obj {
    try {
      const result = this.items.find((v, k) => {
        const result = fn(v, k);

        if (result instanceof Err) {
          throw result;
        }

        return result !== FALSE && result !== NIL;
      });

      return result || NIL;
    } catch (err) {
      return err;
    }
  }

  public map(fn: (v: Obj, k: Obj) => Obj | Err): Hash | Err {
    try {
      return new Hash(
        this.items.map((v, k) => {
          const result = fn(v, k);

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

  public filter(fn: (v: Obj, k: Obj) => Obj): Hash | Err {
    try {
      return new Hash(
        this.items.filter((v, k) => {
          const result = fn(v, k);

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

  public reduce(fn: (acc: Obj, v: Obj, k: Obj) => Obj, initial: Obj): Obj | Err {
    try {
      return this.items.reduce((acc, v, k) => {
        const result = fn(acc, v, k);

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

  public each(fn: (v: Obj, k: Obj) => Nil | Err): Nil | Err {
    try {
      this.items.forEach((v, k) => {
        const result = fn(v, k);

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

  public add(that: Obj): Hash | Err {
    if (that instanceof Hash) {
      return new Hash(this.items.concat(that.items));
    }

    return new Err('');
  }

  public subtract(that: Obj): Hash | Err {
    if (that instanceof Set) {
      const items = this.items.asMutable();

      for (const key of that.items) {
        items.remove(key);
      }

      return new Hash(items.toMap());
    }

    return new Err('');
  }
}

export class Set {
  public items: Immutable.Set<Obj>;

  constructor(items: Iterable<Obj> | ArrayLike<Obj>) {
    this.items = Immutable.Set(items);
  }

  public inspect(): string {
    return '{' + this.items.map(item => item.inspect()).join(', ') + '}';
  }

  public hashCode(): number {
    return this.items.hashCode();
  }

  public equals(that: Obj): boolean {
    return that instanceof Set && this.items.equals(that.items);
  }

  public get(index: Obj): Obj | Err {
    return this.items.get(index) || NIL;
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool | Err {
    return this.items.contains(subject) ? TRUE : FALSE;
  }

  public find(fn: (v: Obj) => Obj): Obj {
    try {
      const result = this.items.find(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        return result !== FALSE && result !== NIL;
      });

      return result || NIL;
    } catch (err) {
      return err;
    }
  }

  public map(fn: (v: Obj) => Obj | Err): Set | Err {
    try {
      return new Set(
        this.items.map(v => {
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

  public filter(fn: (v: Obj) => Obj): Set | Err {
    try {
      return new Set(
        this.items.filter(v => {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj | Err {
    try {
      return this.items.reduce((acc, v) => {
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

  public each(fn: (v: Obj) => Nil | Err): Nil | Err {
    try {
      this.items.forEach(v => {
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

  public add(that: Obj): Set | Err {
    if (that instanceof Set) {
      return new Set(this.items.concat(that.items));
    }

    return new Err('');
  }

  public subtract(that: Obj): Set | Err {
    if (that instanceof Set) {
      return new Set(this.items.subtract(that.items));
    }

    return new Err('');
  }
}

export class Range implements ValueObj {
  private constructor(
    public start: number,
    public end: number,
    public items: Immutable.Seq.Indexed<Obj>
  ) {}

  public static fromRange(start: number, end: number) {
    return new Range(
      start,
      end,
      Immutable.Range(start, end + (end < 0 ? -1 : 1)).map(v => new Integer(v))
    );
  }

  public inspect(): string {
    if (this.end === Infinity) {
      return (
        '[' +
        this.items
          .take(3)
          .map(item => item.inspect())
          .join(', ') +
        ', ..∞]'
      );
    }

    return '[' + this.items.map(item => item.inspect()).join(', ') + ']';
  }

  public hashCode(): number {
    return this.items.hashCode();
  }

  public equals(that: Obj): boolean {
    return that instanceof Range && this.items.equals(that.items);
  }

  public get(index: Obj): Obj | Err {
    if (index instanceof Integer) {
      return this.items.get(index.value) || NIL;
    }

    if (index instanceof Range) {
      return new Range(this.start, this.end, this.items.slice(index.start, index.end));
    }

    return new Err(
      `Unsupported 'get' operation ${this.constructor.name}, ${index.constructor.name}`
    );
  }

  public size(): Err | Integer {
    if (this.end === Infinity) {
      return new Integer(Infinity);
    }

    this.items.cacheResult();

    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool | Err {
    return subject instanceof Integer && this.items.contains(subject) ? TRUE : FALSE;
  }

  public first(): Obj | Nil | Err {
    return this.items.first() || NIL;
  }

  public rest(): Range | Err {
    return new Range(this.start, this.end, this.items.rest());
  }

  public last(): Obj | Nil | Err {
    if (this.end === Infinity) {
      return new Err('Unable to find last item within an infinite range');
    }

    return this.items.last() || NIL;
  }

  public take(total: Integer): Range | Err {
    return new Range(this.start, 0, this.items.take(total.value));
  }

  public skip(total: Integer): Range | Err {
    return new Range(this.start, this.end, this.items.skip(total.value));
  }

  public find(fn: (v: Obj) => Obj): Obj {
    try {
      const result = this.items.find(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        return result !== FALSE && result !== NIL;
      });

      return result || NIL;
    } catch (err) {
      return err;
    }
  }

  public zip(collections: List): List | Range | Err {
    const zipped = this.items.zipWith(
      (...values) => new List(values),
      ...collections.getInteralSeq().map(collection => collection.getInteralSeq())
    );

    return zipped.size === Infinity ? new Range(this.start, Infinity, zipped) : new List(zipped);
  }

  public map(fn: (v: Obj) => Obj | Err): Range | Err {
    try {
      return new Range(
        this.start,
        this.end,
        this.items.map(v => {
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

  public filter(fn: (v: Obj) => Obj): Range | Err {
    try {
      return new Range(
        this.start,
        this.end,
        this.items.filter(v => {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj | Err {
    if (this.end === Infinity) {
      return new Err('Unable to reduce an infinite range');
    }

    try {
      return this.items.reduce((acc, v) => {
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

  public each(fn: (v: Obj) => Nil | Err): Nil | Err {
    try {
      if (this.end === Infinity) {
        this.items.size = 0;
      }

      this.items.forEach(v => {
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
    } finally {
      if (this.end === Infinity) {
        this.items.size = Infinity;
      }
    }
  }

  public getInteralSeq(): Immutable.Seq {
    return this.items;
  }
}
