import alt from '../alt';
import QueryApiUtils from '../utils/QueryApiUtils'
import logError from '../utils/logError'

class QueryActions {
  constructor() {
    this.generateActions(
      'receivedQuery',
      'receivedQueries',
      'selectQuery',
      'receivedQueryPreview'
    );
  }

  createQuery(data) {
    QueryApiUtils.createQuery(data).then((query) => {
      this.actions.receivedQuery(query);
    }).catch(logError);
  }

  destroyQuery(uuid) {
    QueryApiUtils.destroyQuery(uuid).then(() => {
      this.dispatch(uuid);
    }).catch(logError);
  }

  fetchSavedQueries() {
    QueryApiUtils.fetchSavedQueries().then((results) => {
      this.actions.receivedQueries(results);
    }).catch(logError);
  }

  loadQueryPreview(file) {
    QueryApiUtils.loadQueryPreview(file).then((results) => {
      this.actions.receivedQueryPreview(results);
    }).catch(logError);
  }
}

export default alt.createActions(QueryActions);
