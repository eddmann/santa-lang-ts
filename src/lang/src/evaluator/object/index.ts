import * as collection from './collection';
import * as environment from './environment';
import * as error from './error';
import * as fn from './function';
import * as primitive from './primitive';
import * as section from './section';
import * as type from './type';

export default {
  ...collection,
  ...environment,
  ...error,
  ...fn,
  ...primitive,
  ...section,
  ...type,
};
