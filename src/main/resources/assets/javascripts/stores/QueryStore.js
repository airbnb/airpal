import alt from '../alt'
import FluxCollection from '../utils/FluxCollection'
import QueryActions from '../actions/QueryActions'
import QueryApiUtils from '../utils/QueryApiUtils'

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

  onReceiveDestroyedQuery(uuid) {
    this.collection.remove(uuid);
  }

  onCreateQuery(data) {
    QueryApiUtils.createQuery(data);
    return false;
  }

  onDestroyQuery(uuid) {
    QueryApiUtils.destroyQuery(uuid);
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
