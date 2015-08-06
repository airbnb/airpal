import alt from '../alt'
import FluxCollection from '../utils/FluxCollection'
import QueryActions from '../actions/QueryActions'

class QueryStore {
  constructor() {
    // handle store listeners
    this.bindListeners({
      onSelectQuery: QueryActions.SELECT_QUERY,
      onReceivedQueries: QueryActions.RECEIVED_QUERIES,
      onReceivedQuery: QueryActions.RECEIVED_QUERY,
      onDestroyQuery: QueryActions.DESTROY_QUERY,
    });

    // export methods we can use
    this.exportPublicMethods({
      getSelectedQuery: this.getSelectedQuery,
      getCollection: this.getCollection,
    });

    // state
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

  onDestroyQuery(uuid) {
    this.collection.remove(uuid);
  }

  getSelectedQuery() {
    return this.getState().selectedQuery;
  }

  getCollection() {
    return this.getState().collection;
  }
}

export default alt.createStore(QueryStore, 'QueryStore');
