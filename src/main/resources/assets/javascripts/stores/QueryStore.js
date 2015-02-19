/**
 * QueryStore
 */

var BaseStore   = require('./BaseStore');
var AppDispatcher   = require('../dispatchers/AppDispatcher');
var QueryConstants  = require('../constants/QueryConstants');
var QueryApiUtils   = require('../utils/QueryApiUtils');

/* Other stores */
var UserStore = require('./UserStore');

/* Other constants */
var UserConstants   = require('../constants/UserConstants');

/* Query store */
class QueryStoreClass extends BaseStore {
  constructor() {
    super();

    this._selectedQuery = null;

    // Because of a bug, `createdAt` field is null. Just reverse the order
    // using the negative of the index.
    this.comparator = (model, index) => -1 * index;
  }

  selectQuery(query) {
    this._selectedQuery = query;
    this.emitChange('select');
  }

  getSelectedQuery() {
    return this._selectedQuery;
  }

  destroyQuery(uuid) {
    QueryApiUtils.destroyQuery(uuid);
  }
}

var QueryStore = new QueryStoreClass();

QueryStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case QueryConstants.CREATE_QUERY:
      QueryApiUtils.createQuery(action.data, { silent: true });
      break;

    case QueryConstants.RECEIVED_SINGLE_QUERY:
      QueryStore.add(action.query)
      QueryStore.emitChange('change');
      break;

    case QueryConstants.RECEIVED_MULTIPLE_QUERIES:
      QueryStore.add(action.queries);
      QueryStore.emitChange('change');
      break;

    case QueryConstants.SELECT_QUERY:
      QueryStore.selectQuery(action.query);
      QueryStore.emitChange('change');
      break;

    case QueryConstants.DESTROY_QUERY:
      QueryStore.destroyQuery(action.uuid);
      QueryStore.emitChange('change');

    case QueryConstants.RECEIVED_DESTROYED_QUERY:
      QueryStore.remove(action.uuid);
      QueryStore.emitChange('change');

    default:
      // do nothing
  }

});

module.exports = QueryStore;
