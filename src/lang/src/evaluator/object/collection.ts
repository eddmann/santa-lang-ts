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

  public get(index: Obj): Obj {
    if (index instanceof Integer) {
      return this.items.get(index.value) || NIL;
    }

    if (index instanceof Range) {
      return new List(this.items.slice(index.start, index.end));
    }

    throw new Error(
      `Unsupported 'get' operation ${this.constructor.name}, ${index.constructor.name}`
    );
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool {
    return this.items.contains(subject) ? TRUE : FALSE;
  }

  public first(): Obj | Nil {
    return this.items.first() || NIL;
  }

  public rest(): List {
    return new List(this.items.rest());
  }

  public last(): Obj | Nil {
    return this.items.last() || NIL;
  }

  public take(total: Integer): List {
    return new List(this.items.take(total.value));
  }

  public skip(total: Integer): List {
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

  public zip(collections: List): List {
    return new List(
      this.items.zipWith(
        (...values) => new List(values),
        ...collections.getInteralSeq().map(collection => collection.getInteralSeq())
      )
    );
  }

  public map(fn: (v: Obj) => Obj): List {
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

  public filter(fn: (v: Obj) => Obj): List {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
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

  public each(fn: (v: Obj) => Nil | Err): Nil {
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

  public flatMap(fn: (v: Obj) => List | Err): List {
    try {
      return new List(
        this.items.flatMap(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.items;
        })
      );
    } catch (err) {
      return err;
    }
  }

  public add(that: Obj): List {
    if (that instanceof List) {
      return new List(this.items.concat(that.items));
    }

    throw new Error(`${this.constructor.name} + ${that.constructor.name} is not supported`);
  }

  public subtract(that: Obj): List {
    if (that instanceof List) {
      return new List(this.items.filter(item => !that.items.contains(item)));
    }

    throw new Error(`${this.constructor.name} - ${that.constructor.name} is not supported`);
  }

  public multiply(that: Obj): List {
    if (that instanceof Integer) {
      const items = this.items.asMutable();

      let remaining = that.value;
      while (--remaining) {
        items.concat(this.items);
      }

      return new List(items.asImmutable());
    }

    throw new Error(`${this.constructor.name} * ${that.constructor.name} is not supported`);
  }

  public chunk(size: Integer): List {
    return new List(
      Immutable.Range(0, this.items.count(), size.value)
        .map(start => new List(this.items.slice(start, start + size.value)))
        .toList()
    );
  }

  public combinations(size: Integer): List {
    const recur = (size: number, list: Immutable.List): Immutable.List => {
      if (size < 1) {
        return new Immutable.List([new Immutable.List()]);
      }

      if (list.size === 0) {
        return new Immutable.List();
      }

      const first = list.first();
      const rest = list.rest();

      return recur(size - 1, rest)
        .map(list => list.push(first))
        .concat(recur(size, rest));
    };

    return new List(recur(size.value, this.items).map(v => new List(v)));
  }

  public cycle(): List | Range {
    if (this.items.size === 0) {
      return this;
    }

    return Range.fromRange(0, Infinity).map(
      idx => this.items.get(idx.value % this.items.size) as Obj
    );
  }

  public min(): Obj {
    const result = this.items.min((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
  }

  public max(): Obj {
    const result = this.items.max((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
  }

  public getInteralSeq(): Immutable.Seq {
    return this.items;
  }

  public sort(comparator: (a: Obj, b: Obj) => Bool): List {
    return new List(
      this.items.sort((a, b) => {
        if (a.equals(b).value) {
          return 0;
        }

        const result = comparator(a, b);

        if (result instanceof Err) {
          throw result;
        }

        return result !== FALSE && result !== NIL ? 1 : -1;
      })
    );
  }
}

export class Hash {
  private items: Immutable.Map<Obj, Obj>;

  constructor(items: Iterable<[Obj, Obj]>) {
    this.items = Immutable.Map(items);
  }

  public static from(collection: Obj): Hash {
    if (collection instanceof List) {
      return new Hash(
        collection.items.map(v => {
          if (!(v instanceof List) || v.items.size !== 2) {
            throw new Error(
              'The List is expected to be of the form [[K, V], ..] to convert to a Hash'
            );
          }

          return [v.items.get(0), v.items.get(1)];
        })
      );
    }

    throw new Error(`Unable to convert ${collection.constructor.name} into a Hash`);
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

  public get(index: Obj): Obj {
    return this.items.get(index) || NIL;
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool {
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

  public map(fn: (v: Obj, k: Obj) => Obj): Hash {
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

  public filter(fn: (v: Obj, k: Obj) => Obj): Hash {
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

  public reduce(fn: (acc: Obj, v: Obj, k: Obj) => Obj, initial: Obj): Obj {
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

  public each(fn: (v: Obj, k: Obj) => Nil | Err): Nil {
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

  public add(that: Obj): Hash {
    if (that instanceof Hash) {
      return new Hash(this.items.concat(that.items));
    }

    throw new Error(`${this.constructor.name} + ${that.constructor.name} is not supported`);
  }

  public keys(): List {
    return new List(this.items.keys());
  }

  public values(): List {
    return new List(this.items.values());
  }

  public subtract(that: Obj): Hash {
    if (that instanceof Set) {
      const items = this.items.asMutable();

      for (const key of that.items) {
        items.remove(key);
      }

      return new Hash(items.toMap());
    }

    throw new Error(`${this.constructor.name} - ${that.constructor.name} is not supported`);
  }

  public min(): Obj {
    const result = this.items.min((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
  }

  public max(): Obj {
    const result = this.items.max((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
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

  public get(index: Obj): Obj {
    return this.items.get(index) || NIL;
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public contains(subject: Obj): Bool {
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

  public map(fn: (v: Obj) => Obj): Set {
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

  public filter(fn: (v: Obj) => Obj): Set {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
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

  public each(fn: (v: Obj) => Nil | Err): Nil {
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

  public add(that: Obj): Set {
    if (that instanceof Set) {
      return new Set(this.items.concat(that.items));
    }

    throw new Error(`${this.constructor.name} + ${that.constructor.name} is not supported`);
  }

  public subtract(that: Obj): Set {
    if (that instanceof Set) {
      return new Set(this.items.subtract(that.items));
    }

    throw new Error(`${this.constructor.name} - ${that.constructor.name} is not supported`);
  }

  public min(): Obj {
    const result = this.items.min((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
  }

  public max(): Obj {
    const result = this.items.max((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
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

  public get(index: Obj): Obj {
    if (index instanceof Integer) {
      return this.items.get(index.value) || NIL;
    }

    if (index instanceof Range) {
      return new Range(this.start, this.end, this.items.slice(index.start, index.end));
    }

    throw new Error(
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

  public contains(subject: Obj): Bool {
    return subject instanceof Integer && this.items.contains(subject) ? TRUE : FALSE;
  }

  public first(): Obj | Nil {
    return this.items.first() || NIL;
  }

  public rest(): Range {
    return new Range(this.start, this.end, this.items.rest());
  }

  public last(): Obj | Nil {
    if (this.end === Infinity) {
      throw new Error('Unable to find last item within an infinite range');
    }

    return this.items.last() || NIL;
  }

  public take(total: Integer): Range {
    return new Range(this.start, 0, this.items.take(total.value));
  }

  public skip(total: Integer): Range {
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

  public zip(collections: List): List | Range {
    const zipped = this.items.zipWith(
      (...values) => new List(values),
      ...collections.getInteralSeq().map(collection => collection.getInteralSeq())
    );

    return zipped.size === Infinity ? new Range(this.start, Infinity, zipped) : new List(zipped);
  }

  public map(fn: (v: Obj) => Obj): Range {
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

  public filter(fn: (v: Obj) => Obj): Range {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
    if (this.end === Infinity) {
      throw new Error('Unable to reduce an infinite range');
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

  public each(fn: (v: Obj) => Nil | Err): Nil {
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

  public flatMap(fn: (v: Obj) => List | Err): List {
    try {
      return new List(
        this.items.flatMap(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.items;
        })
      );
    } catch (err) {
      return err;
    }
  }

  public min(): Obj {
    const result = this.items.min((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
  }

  public max(): Obj {
    const result = this.items.max((a, b) => {
      if (a.equals(b).value) return 0;
      return a.lessThan(b).value ? -1 : 1;
    });

    return result || NIL;
  }

  public getInteralSeq(): Immutable.Seq {
    return this.items;
  }
}
