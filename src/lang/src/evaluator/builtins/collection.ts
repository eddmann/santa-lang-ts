import { AST } from '../../parser';
import O from '../object';
import { applyFunction } from '../evaluator';

const map: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'mapper',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const mapper = environment.getVariable('mapper');

    return environment.getVariable('collection').map((v, k) => applyFunction(mapper, [v, k]));
  },
};

const filter: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'predicate',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const predicate = environment.getVariable('predicate');

    return environment.getVariable('collection').filter((v, k) => applyFunction(predicate, [v, k]));
  },
};

const filter_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'predicate',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    const predicate = environment.getVariable('predicate');

    return environment
      .getVariable('collection')
      .filter((v, k) => applyFunction(predicate, [v, k]), true);
  },
};

const reduce: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'reducer',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const reducer = environment.getVariable('reducer');

    return environment
      .getVariable('collection')
      .reduce((acc, v, k) => applyFunction(reducer, [acc, v, k]));
  },
};

const fold: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'initial',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'folder',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const folder = environment.getVariable('folder');

    return environment
      .getVariable('collection')
      .fold((acc, v, k) => applyFunction(folder, [acc, v, k]), environment.getVariable('initial'));
  },
};

const fold_s: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'initial',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'folder',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const folder = environment.getVariable('folder');

    const result = environment
      .getVariable('collection')
      .fold((acc, v, k) => applyFunction(folder, [acc, v, k]), environment.getVariable('initial'));

    if (result instanceof O.Err) {
      return result;
    }

    if (result instanceof O.List) {
      return result.first();
    }

    throw new Error('fold_s expects the result to be a List');
  },
};

const scan: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'initial',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'mapper',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const mapper = environment.getVariable('mapper');

    return environment
      .getVariable('collection')
      .scan(
        (previous, value) => applyFunction(mapper, [previous, value]),
        environment.getVariable('initial')
      );
  },
};

const each: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'effect',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const effect = environment.getVariable('effect');

    return environment.getVariable('collection').each((v, k) => applyFunction(effect, [v, k]));
  },
};

const flat_map: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'mapper',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const mapper = environment.getVariable('mapper');

    return environment.getVariable('collection').flatMap((v, k) => applyFunction(mapper, [v, k]));
  },
};

const find: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'predicate',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const predicate = environment.getVariable('predicate');

    return environment.getVariable('collection').find((v, k) => applyFunction(predicate, [v, k]));
  },
};

const reverse: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').reverse();
  },
};

const sort: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'comparator',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const comparator = environment.getVariable('comparator');

    return environment.getVariable('collection').sort((a, b) => applyFunction(comparator, [a, b]));
  },
};

const includes: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').includes(environment.getVariable('value'));
  },
};

const excludes: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').includes(environment.getVariable('value')) ===
      O.TRUE
      ? O.FALSE
      : O.TRUE;
  },
};

const size: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').size();
  },
};

const count: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'predicate',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const predicate = environment.getVariable('predicate');

    return environment.getVariable('collection').count((v, k) => applyFunction(predicate, [v, k]));
  },
};

const chunk: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'size',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').chunk(environment.getVariable('size'));
  },
};

const zip: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'collections',
      },
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').zip(environment.getVariable('collections'));
  },
};

const take: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'total',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').take(environment.getVariable('total'));
  },
};

const skip: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'total',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').skip(environment.getVariable('total'));
  },
};

const first: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').first();
  },
};

const second: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').get(new O.Integer(1));
  },
};

const last: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').last();
  },
};

const rest: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').rest();
  },
};

const combinations: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'size',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').combinations(environment.getVariable('size'));
  },
};

const keys: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').keys();
  },
};

const values: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').values();
  },
};

const hash: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Hash.from(environment.getVariable('collection'));
  },
};

const set: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Set.from(environment.getVariable('collection'));
  },
};

const list: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return O.List.from(environment.getVariable('collection'));
  },
};

const cycle: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').cycle();
  },
};

const min: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'values',
      },
    },
  ],
  body: (environment: O.Environment) => {
    const values = [...environment.getVariable('values').items];

    if (values.length === 1) {
      return values[0].min();
    }

    return new O.List(values).min();
  },
};

const max: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'values',
      },
    },
  ],
  body: (environment: O.Environment) => {
    const values = [...environment.getVariable('values').items];

    if (values.length === 1) {
      return values[0].max();
    }

    return new O.List(values).max();
  },
};

const mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').asMutable();
  },
};

const immutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').asImmutable();
  },
};

const assoc: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment
      .getVariable('collection')
      .assoc(environment.getVariable('key'), environment.getVariable('value'));
  },
};

const assoc_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment
      .getVariable('collection')
      .assoc(environment.getVariable('key'), environment.getVariable('value'));
  },
};

const update_with_default: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'default',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'updater',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment
      .getVariable('collection')
      .update(environment.getVariable('key'), environment.getVariable('default'), v =>
        applyFunction(environment.getVariable('updater'), [v])
      );
  },
};

const update_with_default_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'default',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'updater',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment
      .getVariable('collection')
      .update(environment.getVariable('key'), environment.getVariable('default'), v =>
        applyFunction(environment.getVariable('updater'), [v])
      );
  },
};

const update: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },

    {
      kind: AST.ASTKind.Identifier,
      value: 'updater',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment
      .getVariable('collection')
      .update(environment.getVariable('key'), O.NIL, v =>
        applyFunction(environment.getVariable('updater'), [v])
      );
  },
};

const update_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'updater',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment
      .getVariable('collection')
      .update(environment.getVariable('key'), O.NIL, v =>
        applyFunction(environment.getVariable('updater'), [v])
      );
  },
};

const assign: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment
      .getVariable('collection')
      .assign(environment.getVariable('key'), environment.getVariable('value'));
  },
};

const assign_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment
      .getVariable('collection')
      .assign(environment.getVariable('key'), environment.getVariable('value'));
  },
};

const push: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment.getVariable('collection').push(environment.getVariable('value'));
  },
};

const push_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment.getVariable('collection').push(environment.getVariable('value'));
  },
};

const get: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').get(environment.getVariable('key'));
  },
};

const repeat: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'value',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Range.repeat(environment.getVariable('value'));
  },
};

const range: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'start',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'end',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'step',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Range.fromRange(
      environment.getVariable('start').value,
      environment.getVariable('end').value,
      environment.getVariable('step').value
    );
  },
};

const all: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'predicate',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment
      .getVariable('collection')
      .filter((v, k) => applyFunction(environment.getVariable('predicate'), [v, k]))
      .equals(environment.getVariable('collection'))
      ? O.TRUE
      : O.FALSE;
  },
};

const any: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'predicate',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment
      .getVariable('collection')
      .find((v, k) => applyFunction(environment.getVariable('predicate'), [v, k])) === O.NIL
      ? O.FALSE
      : O.TRUE;
  },
};

const remove: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment.getVariable('collection').remove(environment.getVariable('key'));
  },
};

const remove_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'key',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment.getVariable('collection').remove(environment.getVariable('key'));
  },
};

const shuffle: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').shuffle();
  },
};

const rotate: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'steps',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (!environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected immutable collection');
    }

    return environment.getVariable('collection').rotate(environment.getVariable('steps'));
  },
};

const rotate_mutable: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'steps',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    if (environment.getVariable('collection').isImmutable()) {
      throw new Error('Expected mutable collection');
    }

    return environment.getVariable('collection').rotate(environment.getVariable('steps'));
  },
};

const iterate: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'fn',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'initial',
    },
  ],
  body: (environment: O.Environment) => {
    return O.Sequence.iterate(
      previous => applyFunction(environment.getVariable('fn'), [previous]),
      environment.getVariable('initial')
    );
  },
};

const sum: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').sum();
  },
};

const union: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'collections',
      },
    },
  ],
  body: (environment: O.Environment) => {
    const collections = [...environment.getVariable('collections').items];

    if (collections.length === 1) {
      return O.Set.union([...collections[0].items]);
    }

    return O.Set.union(collections);
  },
};

const intersect: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.RestElement,
      argument: {
        kind: AST.ASTKind.Identifier,
        value: 'collections',
      },
    },
  ],
  body: (environment: O.Environment) => {
    const collections = [...environment.getVariable('collections').items];

    if (collections.length === 1) {
      return O.Set.intersect([...collections[0].items]);
    }

    return O.Set.intersect(collections);
  },
};

const vec_add: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'a',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'b',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('a').vectorAdd(environment.getVariable('b'));
  },
};

export default {
  map,
  filter,
  'filter!': filter_mutable,
  reduce,
  fold,
  fold_s,
  scan,
  each,
  flat_map,
  find,
  reverse,
  sort,
  includes,
  excludes,
  size,
  count,
  chunk,
  zip,
  take,
  skip,
  first,
  second,
  last,
  rest,
  min,
  max,
  combinations,
  hash,
  set,
  list,
  cycle,
  keys,
  values,
  'mut!': mutable,
  imut: immutable,
  assoc,
  'assoc!': assoc_mutable,
  update,
  'update!': update_mutable,
  update_d: update_with_default,
  'update_d!': update_with_default_mutable,
  assign,
  'assign!': assign_mutable,
  push: push,
  'push!': push_mutable,
  remove,
  'remove!': remove_mutable,
  get,
  repeat,
  range,
  all,
  any,
  shuffle,
  rotate,
  'rotate!': rotate_mutable,
  iterate,
  sum,
  union,
  intersect,
  vec_add,
};
