import Immutable from 'immutable';
import { ValueObj, Obj } from './type';
import { Err } from './error';
import { BreakValue } from './function';
import { Integer, Bool, Nil, Str, TRUE, FALSE, NIL } from './primitive';

export class List implements ValueObj {
  public items: Immutable.List<Obj>;

  constructor(items: Iterable<Obj> | ArrayLike<Obj>) {
    this.items = Immutable.List(items);
  }

  public asMutable() {
    return new List(this.items.asMutable());
  }

  public asImmutable() {
    return new List(this.items.asImmutable());
  }

  public isImmutable(): boolean {
    return !this.items.__ownerID;
  }

  public static from(collection: Obj): List {
    if (collection instanceof List) {
      return new List(collection.items);
    }

    if (collection instanceof Set) {
      return new List(collection.items);
    }

    if (collection instanceof Hash) {
      return new List([...collection.items.entries()].map(entry => new List(entry)));
    }

    if (collection instanceof Range) {
      return new List(collection.items);
    }

    throw new Error(`Unable to convert ${collection.getName()} into a List`);
  }

  public inspect(): string {
    return '[' + this.items.map(item => item.inspect()).join(', ') + ']';
  }

  public isTruthy(): boolean {
    return this.items.size > 0;
  }

  public getName(): string {
    return 'List';
  }

  public hashCode(): number {
    return this.items.hashCode();
  }

  public equals(that: Obj): boolean {
    return that instanceof List && this.items.equals(that.items);
  }

  public get(index: Obj): Obj {
    if (index instanceof Bool) {
      return this.items.get(index.value ? 1 : 0) || NIL;
    }

    if (index instanceof Integer) {
      return this.items.get(index.value) || NIL;
    }

    if (index instanceof Range) {
      return new List(this.items.slice(index.start, index.end));
    }

    throw new Error(`Unsupported 'get' operation ${this.getName()}, ${index.getName()}`);
  }

  public size(): Err | Integer {
    return new Integer(this.items.size);
  }

  public includes(subject: Obj): Bool {
    return this.items.includes(subject) ? TRUE : FALSE;
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

        return result.isTruthy();
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

  public scan(fn: (previous: Obj, value: Obj) => Obj, initial: Obj): List {
    try {
      let previous = initial;

      return new List(
        Immutable.List([previous]).merge(
          this.items.map(value => {
            previous = fn(previous, value);

            if (previous instanceof Err) {
              throw previous;
            }

            return previous;
          })
        )
      );
    } catch (err) {
      return err;
    }
  }

  public filter(fn: (v: Obj) => Obj, isMutable: boolean = false): List {
    try {
      if (isMutable) {
        this.items = this.items
          .filter(v => {
            const result = fn(v);

            if (result instanceof Err) {
              throw result;
            }

            return result.isTruthy();
          })
          .asMutable();
        return this;
      }

      return new List(
        this.items.filter(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public count(fn: (v: Obj) => Obj): Integer {
    try {
      return new Integer(
        this.items.count(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public fold(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj): Obj {
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
      });
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

    if (that instanceof Set) {
      return new List(this.items.concat(that.items));
    }

    if (that instanceof Range) {
      return new List(this.items.concat(that.items));
    }

    throw new Error(`${this.getName()} + ${that.getName()} is not supported`);
  }

  public vectorAdd(that: Obj): List {
    if (!(that instanceof List)) {
      throw new Error(`${this.getName()} + ${that.getName()} is not supported`);
    }

    return new List(this.items.zip(that.items).map(row => new List(row).sum()));
  }

  public subtract(that: Obj): List {
    if (that instanceof List) {
      return new List(this.items.filter(item => !that.items.includes(item)));
    }

    if (that instanceof Set) {
      return new List(this.items.filter(item => !that.items.includes(item)));
    }

    throw new Error(`${this.getName()} - ${that.getName()} is not supported`);
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

    throw new Error(`${this.getName()} * ${that.getName()} is not supported`);
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

    return Range.fromRange(0, Infinity, 1).map(
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

  public sum(): Obj {
    if (this.items.isEmpty()) {
      return new Integer(0);
    }

    return this.items.reduce((acc: Obj, el: Obj) => acc.add(el));
  }

  public remove(key: Obj): Obj {
    if (key instanceof Integer) {
      return new List(this.items.remove(key.value));
    }

    throw new Error(`remove(${key.getName()}, ${this.getName()}) is not supported`);
  }

  public getInteralSeq(): Immutable.Seq {
    return this.items;
  }

  public sort(comparator: (a: Obj, b: Obj) => Bool | Integer): List {
    return new List(
      this.items.sort((a, b) => {
        const result = comparator(a, b);

        if (result instanceof Err) {
          throw result;
        }

        if (result instanceof Integer) {
          return result.value;
        }

        return result.isTruthy() ? 1 : -1;
      })
    );
  }

  public reverse(): List {
    return new List(this.items.reverse());
  }

  public assoc(index: Obj, value: Obj): List {
    if (!(index instanceof Integer)) {
      throw new Error('Expected List index to be an Integer');
    }

    return new List(this.items.set(index.value, value).map(v => v || NIL));
  }

  public update(index: Obj, defaultValue: Obj, updater: (index: Obj) => Obj): List {
    if (!(index instanceof Integer)) {
      throw new Error('Expected List index to be an Integer');
    }

    return new List(
      this.items
        .update(index.value, defaultValue, value => {
          const nextValue = updater(value);

          if (nextValue instanceof Err) {
            throw nextValue;
          }

          return nextValue;
        })
        .map(v => v || NIL)
    );
  }

  public assign(index: Obj, value: Obj): List {
    if (!(index instanceof Integer)) {
      throw new Error('Expected List index to be an Integer');
    }

    return new List(this.items.set(index.value, value));
  }

  public push(value: Obj): List {
    return new List(this.items.push(value));
  }

  shuffle() {
    return new List(
      // Fisher-Yates shuffle
      this.items.withMutations(list => {
        let idx = list.size;

        while (idx) {
          const swapIdx = Math.floor(Math.random() * idx--);
          const currentValue = list.get(idx);
          list.set(idx, list.get(swapIdx));
          list.set(swapIdx, currentValue);
        }
      })
    );
  }

  rotate(steps: Obj) {
    if (!(steps instanceof Integer)) {
      throw new Error('Expected List steps to be an Integer');
    }

    const times = steps.value;

    if (times === 0) {
      return this;
    }

    const items = this.isImmutable() ? this.items.asMutable() : this.items;

    if (times > 0) {
      for (let i = 0; i < times; i++) {
        const last = items.last();
        items.pop();
        items.unshift(last);
      }
    }

    if (times < 0) {
      for (let i = 0; i < Math.abs(times); i++) {
        const head = items.first();
        items.shift();
        items.push(head);
      }
    }

    return this.isImmutable() ? new List(items.asImmutable()) : this;
  }
}

export class Hash {
  public items: Immutable.Map<Obj, Obj>;

  constructor(items: Iterable<[Obj, Obj]>) {
    this.items = Immutable.Map(items);
  }

  public asMutable() {
    return new Hash(this.items.asMutable());
  }

  public asImmutable() {
    return new Hash(this.items.asImmutable());
  }

  public isImmutable(): boolean {
    return !this.items.__ownerID;
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

    if (collection instanceof Hash) {
      return new Hash(collection.items);
    }

    throw new Error(`Unable to convert ${collection.getName()} into a Hash`);
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

  public isTruthy(): boolean {
    return this.items.size > 0;
  }

  public getName(): string {
    return 'Hash';
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

  public includes(subject: Obj): Bool {
    return this.items.includes(subject) ? TRUE : FALSE;
  }

  public find(fn: (v: Obj, k: Obj) => Obj): Obj {
    try {
      const result = this.items.find((v, k) => {
        const result = fn(v, k);

        if (result instanceof Err) {
          throw result;
        }

        return result.isTruthy();
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

  public filter(fn: (v: Obj, k: Obj) => Obj, isMutable: boolean = false): Hash {
    try {
      if (isMutable) {
        this.items = this.items
          .filter((v, k) => {
            const result = fn(v, k);

            if (result instanceof Err) {
              throw result;
            }

            return result.isTruthy();
          })
          .asMutable();
        return this;
      }

      return new Hash(
        this.items.filter((v, k) => {
          const result = fn(v, k);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public count(fn: (v: Obj, k: Obj) => Obj): Integer {
    try {
      return new Integer(
        this.items.count((v, k) => {
          const result = fn(v, k);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public fold(fn: (acc: Obj, v: Obj, k: Obj) => Obj, initial: Obj): Obj {
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

  public reduce(fn: (acc: Obj, v: Obj, k: Obj) => Obj): Obj {
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
      });
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

    throw new Error(`${this.getName()} + ${that.getName()} is not supported`);
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

    throw new Error(`${this.getName()} - ${that.getName()} is not supported`);
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

  public sum(): Obj {
    if (this.items.isEmpty()) {
      return new Integer(0);
    }

    return this.items.reduce((acc: Obj, el: Obj) => acc.add(el));
  }

  public remove(key: Obj): Obj {
    return new Hash(this.items.remove(key));
  }

  public assoc(key: Obj, value: Obj): Hash {
    return new Hash(this.items.set(key, value));
  }

  public update(key: Obj, defaultValue: Obj, updater: (key: Obj) => Obj): Hash {
    return new Hash(
      this.items.update(key, defaultValue, value => {
        const nextValue = updater(value);

        if (nextValue instanceof Err) {
          throw nextValue;
        }

        return nextValue;
      })
    );
  }

  public assign(key: Obj, value: Obj): Hash {
    return new Hash(this.items.set(key, value));
  }
}

export class Set {
  public items: Immutable.Set<Obj>;

  constructor(items: Iterable<Obj> | ArrayLike<Obj>) {
    this.items = Immutable.Set(items);
  }

  public asMutable() {
    return new Set(this.items.asMutable());
  }

  public asImmutable() {
    return new Set(this.items.asImmutable());
  }

  public isImmutable(): boolean {
    return !this.items.__ownerID;
  }

  public static union(collections: Obj[]): Set {
    return new Set(Immutable.Set.union(collections.map(collection => collection.items)));
  }

  public static intersect(collections: Obj[]): Set {
    return new Set(Immutable.Set.intersect(collections.map(collection => collection.items)));
  }

  public static from(collection: Obj): Set {
    if (collection instanceof List) {
      return new Set(collection.items);
    }

    if (collection instanceof Set) {
      return new Set(collection.items);
    }

    if (collection instanceof Range) {
      return new Set(collection.items);
    }

    if (collection instanceof Str) {
      return new Set(collection.split(new Str('')).items);
    }

    throw new Error(`Unable to convert ${collection.getName()} into a Set`);
  }

  public inspect(): string {
    return '{' + this.items.map(item => item.inspect()).join(', ') + '}';
  }

  public isTruthy(): boolean {
    return this.items.size > 0;
  }

  public getName(): string {
    return 'Set';
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

  public includes(subject: Obj): Bool {
    return this.items.includes(subject) ? TRUE : FALSE;
  }

  public find(fn: (v: Obj) => Obj): Obj {
    try {
      const result = this.items.find(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        return result.isTruthy();
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

  public filter(fn: (v: Obj) => Obj, isMutable: boolean = false): Set {
    try {
      if (isMutable) {
        this.items = this.items
          .filter(v => {
            const result = fn(v);

            if (result instanceof Err) {
              throw result;
            }

            return result.isTruthy();
          })
          .asMutable();
        return this;
      }

      return new Set(
        this.items.filter(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public count(fn: (v: Obj) => Obj): Integer {
    try {
      return new Integer(
        this.items.count(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public fold(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj): Obj {
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
      });
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

  public push(value: Obj): Set {
    return new Set(this.items.add(value));
  }

  public add(that: Obj): Set {
    if (that instanceof List) {
      return new Set(this.items.concat(that.items));
    }

    if (that instanceof Set) {
      return new Set(this.items.concat(that.items));
    }

    if (that instanceof Range) {
      return new Set(this.items.concat(that.items));
    }

    throw new Error(`${this.getName()} + ${that.getName()} is not supported`);
  }

  public subtract(that: Obj): Set {
    if (that instanceof Set) {
      return new Set(this.items.subtract(that.items));
    }

    if (that instanceof List) {
      return new Set(this.items.subtract(that.items));
    }

    throw new Error(`${this.getName()} - ${that.getName()} is not supported`);
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

  public sum(): Obj {
    if (this.items.isEmpty()) {
      return new Integer(0);
    }

    return this.items.reduce((acc: Obj, el: Obj) => acc.add(el));
  }

  public remove(key: Obj): Obj {
    return new Set(this.items.remove(key));
  }
}

export class Range implements ValueObj {
  private constructor(
    public start: number,
    public end: number,
    public items: Immutable.Seq.Indexed<Obj>
  ) {}

  public static fromRange(start: number, end: number, step: number) {
    return new Range(
      start,
      end,
      Immutable.Range(start, end + (end < start ? -1 : 1), step).map(v => new Integer(v))
    );
  }

  public static repeat(value: Obj) {
    return new Range(0, Infinity, Immutable.Repeat(value));
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

  public isTruthy(): boolean {
    if (this.end === Infinity) {
      return true;
    }

    this.items.cacheResult();

    return this.items.size > 0;
  }

  public getName(): string {
    return 'Range';
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

    throw new Error(`Unsupported 'get' operation ${this.getName()}, ${index.getName()}`);
  }

  public size(): Err | Integer {
    if (this.end === Infinity) {
      return new Integer(Infinity);
    }

    this.items.cacheResult();

    return new Integer(this.items.size);
  }

  public includes(subject: Obj): Bool {
    if (!(subject instanceof Integer)) {
      return FALSE;
    }

    if (this.end === Infinity) {
      return subject.value >= this.start ? TRUE : FALSE;
    }

    return this.items.includes(subject) ? TRUE : FALSE;
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

        return result.isTruthy();
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

    return zipped.size === Infinity || zipped.size === undefined
      ? new Range(this.start, Infinity, zipped)
      : new List(zipped);
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

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public count(fn: (v: Obj) => Obj): Integer {
    try {
      return new Integer(
        this.items.count(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public fold(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
    if (this.end === Infinity) {
      throw new Error('Unable to fold an infinite range');
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj): Obj {
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
      });
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

  public sum(): Obj {
    if (this.items.isEmpty()) {
      return new Integer(0);
    }

    return this.items.reduce((acc: Obj, el: Obj) => acc.add(el));
  }

  public getInteralSeq(): Immutable.Seq {
    return this.items;
  }

  public isImmutable(): boolean {
    return true;
  }
}

export class Sequence implements ValueObj {
  private constructor(public items: Immutable.Seq.Indexed<Obj>) {}

  public static iterate(fn: (previous: Obj) => Obj, initial: Obj) {
    return new Sequence(
      Immutable.Seq(
        (function* () {
          let current = initial;
          while (true) {
            yield current;
            current = fn(current);
          }
        })()
      )
    );
  }

  public inspect(): string {
    return '[' + this.items.map(item => item.inspect()).join(', ') + ']';
  }

  public isTruthy(): boolean {
    return true;
  }

  public getName(): string {
    return 'Sequence';
  }

  public hashCode(): number {
    return this.items.hashCode();
  }

  public equals(that: Obj): boolean {
    return that instanceof Sequence && this.items.equals(that.items);
  }

  public get(index: Obj): Obj {
    if (index instanceof Integer) {
      return this.items.get(index.value) || NIL;
    }

    if (index instanceof Range) {
      return new Sequence(this.items.slice(index.start, index.end));
    }

    throw new Error(`Unsupported 'get' operation ${this.getName()}, ${index.getName()}`);
  }

  public size(): Err | Integer {
    return new Integer(Infinity);
  }

  public includes(subject: Obj): Bool {
    return subject instanceof Integer && this.items.includes(subject) ? TRUE : FALSE;
  }

  public first(): Obj | Nil {
    return this.items.first() || NIL;
  }

  public rest(): Sequence {
    return new Sequence(this.items.rest());
  }

  public last(): Obj | Nil {
    return this.items.last() || NIL;
  }

  public take(total: Integer): List {
    return new List(this.items.take(total.value).toList());
  }

  public skip(total: Integer): Sequence {
    return new Sequence(this.items.skip(total.value));
  }

  public find(fn: (v: Obj) => Obj): Obj {
    try {
      const result = this.items.find(v => {
        const result = fn(v);

        if (result instanceof Err) {
          throw result;
        }

        return result.isTruthy();
      });

      return result || NIL;
    } catch (err) {
      return err;
    }
  }

  public zip(collections: List): List | Sequence {
    const zipped = this.items.zipWith(
      (...values) => new List(values),
      ...collections.getInteralSeq().map(collection => collection.getInteralSeq())
    );

    return zipped.size === Infinity || zipped.size === undefined
      ? new Sequence(zipped)
      : new List(zipped);
  }

  public map(fn: (v: Obj) => Obj): Sequence {
    try {
      return new Sequence(
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

  public filter(fn: (v: Obj) => Obj): Sequence {
    try {
      return new Sequence(
        this.items.filter(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public count(fn: (v: Obj) => Obj): Integer {
    try {
      return new Integer(
        this.items.count(v => {
          const result = fn(v);

          if (result instanceof Err) {
            throw result;
          }

          return result.isTruthy();
        })
      );
    } catch (err) {
      return err;
    }
  }

  public fold(fn: (acc: Obj, v: Obj) => Obj, initial: Obj): Obj {
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

  public reduce(fn: (acc: Obj, v: Obj) => Obj): Obj {
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
      });
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
    } finally {
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

  public isImmutable(): boolean {
    return true;
  }
}
