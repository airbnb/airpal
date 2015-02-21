import alt from '../alt';

import QueryApiUtils from '../utils/QueryApiUtils';

class QueryActions {
  constructor() {
    this.generateActions(
      'receiveQuery',
      'receivedQueries',
      'receivedDestroyedQuery',
      'selectQuery'
    );
  }

  destroyQuery(uuid) {
    QueryApiUtils.destroyQuery(uuid);
  }

  createQuery(data) {
    QueryApiUtils.createQuery(data);
  }
}

export default alt.createActions(QueryActions);
