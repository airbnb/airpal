import alt from '../alt'
import FluxCollection from '../utils/FluxCollection'
import QueryActions from '../actions/QueryActions'
import QueryApiUtils from '../utils/QueryApiUtils'
import logError from '../utils/logError'

class QueryStore {
  constructor() {
    this.bindActions(QueryActions);

    this.selectedQuery = null;

    this.collection = new FluxCollection({
      comparator: (model, index) => -1 * index
    });
  }

  onSelectQuery(query) {
    this.selectedQuery = query;
  }

  onReceivedQuery(query) {
    this.collection.add(query);
  }

  onReceivedQueries(queries) {
    this.collection.add(queries);
  }

  onCreateQuery(data) {
    QueryApiUtils.createQuery(data).then((query) => {
      QueryActions.receivedQuery(query);
    }).catch(logError);
    return false;
  }

  onDestroyQuery(uuid) {
    QueryApiUtils.destroyQuery(uuid).then(() => {
      this.collection.remove(uuid);
      this.getInstance().emitChange();
    }).catch(logError);
    return false;
  }

  onFetchSavedQueries() {
    QueryApiUtils.fetchSavedQueries().then((results) => {
      QueryActions.receivedQueries(results);
    }).catch(logError);
    return false;
  }

  static getSelectedQuery() {
    return this.getState().selectedQuery;
  }

  static getCollection() {
    return this.getState().collection;
  }
}

export default alt.createStore(QueryStore, 'QueryStore');
