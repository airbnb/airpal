/**
 * QueryStore
 */

var StoreDefaults   = require('./StoreDefaults');
var AppDispatcher   = require('../dispatchers/AppDispatcher');
var QueryConstants  = require('../constants/QueryConstants');
var QueryApiUtils   = require('../utils/QueryApiUtils');

/* Other stores */
var UserStore = require('./UserStore');

/* Other constants */
var UserConstants   = require('../constants/UserConstants');

/* Store helpers */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

/* Query store */
var QueryStore = assign({}, StoreDefaults, EventEmitter.prototype, {

  // Store extentions
});

QueryStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case QueryConstants.CREATE_QUERY:
      QueryApiUtils.add(action.data, { silent: true });
      break;

    case QueryConstants.RECEIVED_SINGLE_QUERY:
      QueryStore.add(action.query)
      QueryStore.emitChange('change');
      break;

    case QueryConstants.RECEIVED_MULTIPLE_QUERIES:
      QueryStore.add(action.queries);
      QueryStore.emitChange('change');
      break;

    case QueryConstants.UPDATE_QUERY:
      QueryApiUtils.updateQuery(action.uuid, action.query);
      QueryStore.emitChange('change');
      break;

    case QueryConstants.RECEIVED_UPDATED_QUERY:
      QueryStore.update(action.uuid, action.query);
      QueryStore.emitChange('change');
      break;

    default:
      // do nothing
  }

});

module.exports = QueryStore;
