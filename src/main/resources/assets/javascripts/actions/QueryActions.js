import alt from '../alt';

class QueryActions {
  constructor() {
    this.generateActions(
      'receivedQuery',
      'receivedQueries',
      'fetchSavedQueries',
      'fetchedSavedQueries',
      'selectQuery',
      'destroyQuery',
      'createQuery'
    );
  }
}

export default alt.createActions(QueryActions);
