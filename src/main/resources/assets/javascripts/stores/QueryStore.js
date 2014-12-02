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
  if( QueryStore.get(query.id) ) {
    _updateQuery(query.id, query);
    return;
  }

  // Add the new query to the collection
  _queries.push(query);
}

// Updates a specific query from the collection
// @param {integer} the id of the updated query
// @param {object} the updated query object
function _updateQuery(id, updatedQuery) {
  if( QueryStore.get(id) === undefined ) return;

  // Get the old query from the local store
  var _oldQuery = QueryStore.get(id);

  // Update the query and create a "new" query
  var newQuery = _.extend(_oldQuery, updatedQuery);

  // Remove the old value from the _queries object
  _removeQuery(id);

  // Push the query to the other queries
  _queries.push(newQuery);
}

// Destroys a specific query from the collection
// @param {integer} the query to remove
function _removeQuery(id) {
  if( QueryStore.get(id) === undefined ) return;

  // Remove the query from the collection
  _queries = _.reject(_queries, function(query) {
    query.id === id
  });
}

/* Query store */
var QueryStore = assign(StoreDefaults, EventEmitter.prototype, {

  // Get a specific query from the collection
  // @param {integer} the event id
  // @return {object/undefined} the
  get: function(id) {
    return _.find(_queries, { id: id });
  },

  // Get the queries of a specific user
  // @param {name} the name of the user
  getForUser: function(name) {
    return _.find(_queries, { owner: name });
  },

  // Get all current queries from the collection
  // @return {array} the whole collection (sorted)
  all: function() {
    return _.sortBy(_queries, 'id');
  }

});

QueryStore.dispatchToken = QueryDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case QueryConstants.CREATE_QUERY:
      QueryApiUtils.createQuery(action.data);
      break;

    case QueryConstants.RECEIVED_QUERY:
      _addQuery(action.data);
      QueryStore.emitChange('add');
      QueryStore.emitChange('change');
      break;

    case QueryConstants.UPDATE_QUERY:
      QueryApiUtils.updateQuery(action.id, action.data);
      break;

    case QueryConstants.RECEIVED_UPDATED_QUERY:
      _updateQuery(action.id, action.data);
      QueryStore.emitChange('update');
      QueryStore.emitChange('change');
      break;

    case QueryConstants.DESTROY_QUERY:
      QueryApiUtils.destroyQuery(action.id);
      break;

    case QueryConstants.RECEIVED_DESTROY_QUERY:
      _removeQuery(action.id);
      QueryStore.emitChange('destroy');
      QueryStore.emitChange('change');
      break;

    default:
      // do nothing
  }

});

module.exports = QueryStore;
