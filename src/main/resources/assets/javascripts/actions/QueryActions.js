import alt from '../alt';

class QueryActions {
  constructor() {
    this.generateActions(
      'receivedQuery',
      'receivedQueries',
      'receivedDestroyedQuery',
      'selectQuery',
      'destroyQuery',
      'createQuery'
    );
  }
}

export default alt.createActions(QueryActions);
