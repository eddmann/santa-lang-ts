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
    return environment
      .getVariable('collection')
      .map((v, k) => applyFunction(environment.getVariable('mapper'), [v, k]));
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
    return environment
      .getVariable('collection')
      .filter((v, k) => applyFunction(environment.getVariable('predicate'), [v, k]));
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
      value: 'initial',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment
      .getVariable('collection')
      .reduce(
        (acc, v, k) => applyFunction(environment.getVariable('reducer'), [acc, v, k]),
        environment.getVariable('initial')
      );
  },
};

const reduce_s: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'reducer',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'initial',
    },
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    const result = environment
      .getVariable('collection')
      .reduce(
        (acc, v, k) => applyFunction(environment.getVariable('reducer'), [acc, v, k]),
        environment.getVariable('initial')
      );

    if (result instanceof O.Err) {
      return result;
    }

    if (result instanceof O.List) {
      return result.get(new O.Integer(0));
    }

    throw new Error('reduce_s expects the result to be a List');
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
    return environment
      .getVariable('collection')
      .each((v, k) => applyFunction(environment.getVariable('effect'), [v, k]));
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
    return environment
      .getVariable('collection')
      .flatMap((v, k) => applyFunction(environment.getVariable('mapper'), [v, k]));
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
    return environment
      .getVariable('collection')
      .find((v, k) => applyFunction(environment.getVariable('predicate'), [v, k]));
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
    return environment
      .getVariable('collection')
      .sort((a, b) => applyFunction(environment.getVariable('comparator'), [a, b]));
  },
};

const contains: O.BuiltinFuncTemplate = {
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
    return environment.getVariable('collection').contains(environment.getVariable('value'));
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
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').min();
  },
};

const max: O.BuiltinFuncTemplate = {
  parameters: [
    {
      kind: AST.ASTKind.Identifier,
      value: 'collection',
    },
  ],
  body: (environment: O.Environment) => {
    return environment.getVariable('collection').max();
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
    return environment
      .getVariable('collection')
      .assoc(environment.getVariable('key'), environment.getVariable('value'));
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
    return environment
      .getVariable('collection')
      .update(environment.getVariable('key'), environment.getVariable('default'), v =>
        applyFunction(environment.getVariable('updater'), [v])
      );
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

export default {
  map,
  filter,
  reduce,
  reduce_s,
  each,
  flat_map,
  find,
  sort,
  contains,
  size,
  chunk,
  zip,
  take,
  skip,
  first,
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
  assoc,
  update,
  get,
  repeat,
  range,
};
