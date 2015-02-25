import _ from 'lodash';

function validFqnPart(part) {
  return _.isString(part) && !_.isEmpty(part);
}

function getParts(fqn) {
  if (!(!!fqn && _.isString(fqn))) {
    return null;
  }
  return fqn.split('.');
}

function schema(fqn) {
  let parts = getParts(fqn);

  if (parts && parts.length) {
    return parts[0];
  } else {
    return null;
  }
}

function table(fqn) {
  let parts = getParts(fqn);

  if (parts && parts.length) {
    return parts[1];
  } else {
    return null;
  }
}

function toFqn(schema, table) {
  return [schema, table].join('.');
}

export default {
  validFqnPart,
  schema,
  table,
  toFqn
};
