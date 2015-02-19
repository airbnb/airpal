/*
 * QueryActions
 */

var AppDispatcher = require('../dispatchers/AppDispatcher');
var QueryConstants = require('../constants/QueryConstants');

module.exports = {

  // - ViewActions --------------------------------------------------------- //
  createQuery(data) {
    AppDispatcher.handleViewAction({
      type: QueryConstants.CREATE_QUERY,
      data: data
    });
  },

  destroyQuery(uuid) {
    AppDispatcher.handleViewAction({
      type: QueryConstants.DESTROY_QUERY,
      uuid: uuid
    });
  },

  /**
   * Select a query from the history and populate it in the query editor.
   */
  selectQuery(query) {
    AppDispatcher.handleViewAction({
      type: QueryConstants.SELECT_QUERY,
      query: query
    });
  },

  // - ServerActions ------------------------------------------------------- //

  // Triggered when a new query is received
  receivedQuery(query) {
    AppDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_SINGLE_QUERY,
      query: query
    });
  },

  // Triggered when a whole bunch of queries is received
  receivedQueries(queries) {
    AppDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_MULTIPLE_QUERIES,
      queries: queries
    });
  },

  // Triggered when a query is destroyed
  receivedDestroyedQuery(uuid) {
    AppDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_DESTROYED_QUERY,
      uuid: uuid
    });
  }

};
