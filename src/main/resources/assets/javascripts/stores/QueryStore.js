/**
 * QueryStore
 */

var StoreDefaults = require('./StoreDefaults');
var QueryDispatcher = require('../dispatchers/QueryDispatcher');
var QueryConstants = require('../constants/QueryConstants');
var QueryApiUtils = require('../utils/QueryApiUtils')

/* Store helpers */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

/**
 * Queries
 */
var _queries = [];

/* Private functions */

// Adds a new query to the collection
// @param {object} the new query object
function _addQuery(query) {

  // Check our we've already got this query, if so
  // we should update him
  if( QueryStore.get(query.uuid) ) {
    _updateQuery(query.uuid, query);
    return;
  }

  // Add the new query to the collection
  _queries.push(query);
}

// Updates a specific query from the collection
// @param {integer} the id of the updated query
// @param {object} the updated query object
function _updateQuery(uuid, updatedQuery) {
  if( QueryStore.get(uuid) === undefined ) return;

  // Get the old query from the local store
  var _oldQuery = QueryStore.get(uuid);

  // Update the query and create a "new" query
  var newQuery = _.extend(_oldQuery, updatedQuery);

  // Remove the old value from the _queries object
  _removeQuery(uuid);

  // Push the query to the other queries
  _queries.push(newQuery);
}

// Destroys a specific query from the collection
// @param {integer} the query to remove
function _removeQuery(uuid) {
  if( QueryStore.get(uuid) === undefined ) return;

  // Remove the query from the collection
  _queries = _.reject(_queries, function(query) {
    query.uuid === uuid
  });
}

/* Query store */
var QueryStore = assign(StoreDefaults, EventEmitter.prototype, {

  // Get a specific query from the collection
  // @param {integer} the event uuid
  // @return {object/undefined} the
  get: function(uuid) {
    return _.find(_queries, { uuid: uuid });
  },

  // Get the queries of a specific user
  // @param {name} the name of the user
  getForUser: function(name) {
    return _.find(_queries, { owner: name });
  },

  // Get all current queries from the collection
  // @return {array} the whole collection (sorted)
  all: function() {
    return _.sortBy(_queries, 'uuid');
  }

});

QueryStore.dispatchToken = QueryDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case QueryConstants.CREATE_QUERY:
      QueryApiUtils.createQuery(action.data);
      QueryStore.emitChange('create');
      break;

    case QueryConstants.RECEIVED_SINGLE_QUERY:
      _addQuery(action.query);
      QueryStore.emitChange('add');
      QueryStore.emitChange('change');
      break;

    case QueryConstants.UPDATE_QUERY:
      QueryApiUtils.updateQuery(action.uuid, action.query);
      break;

    case QueryConstants.RECEIVED_UPDATED_QUERY:
      _updateQuery(action.uuid, action.query);
      QueryStore.emitChange('update');
      QueryStore.emitChange('change');
      break;

    case QueryConstants.DESTROY_QUERY:
      QueryApiUtils.destroyQuery(action.uuid);
      break;

    case QueryConstants.RECEIVED_DESTROY_QUERY:
      _removeQuery(action.uuid);
      QueryStore.emitChange('destroy');
      QueryStore.emitChange('change');
      break;

    default:
      // do nothing
  }

});

module.exports = QueryStore;
