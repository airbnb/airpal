/*
 * QueryActions
 */

var QueryDispatcher = require('../dispatchers/QueryDispatcher');
var QueryConstants = require('../constants/QueryConstants');

module.exports = {

  // - ViewActions --------------------------------------------------------- //
  createQuery: function(data) {
    QueryDispatcher.handleViewAction({
      type: QueryConstants.CREATE_QUERY,
      data: data
    });
  },

  updateQuery: function(id, data) {
    QueryDispatcher.handleViewAction({
      type: QueryConstants.UPDATE_QUERY,
      id: id,
      data: data
    });
  },

  destroyQuery: function(id) {
    QueryDispatcher.handleViewAction({
      type: QueryConstants.DESTROY_QUERY,
      id: id
    });
  },

  // - ServerActions ------------------------------------------------------- //

  // Triggered when a new query is received
  receivedQuery: function(query) {
    QueryDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_SINGLE_QUERY,
      query: query
    });
  },

  // Triggered when a whole bunch of queries is received
  receivedQueries: function(queries) {
    QueryDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_MULTIPLE_QUERIES,
      queries: queries
    });
  },

  // Triggered when a query is updated
  receivedUpdatedQuery: function(id, query) {
    QueryDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_UPDATED_QUERY,
      id: id,
      query: query
    });
  },

  // Triggered when a query is destroyed
  receivedDestroyedQuery: function(id) {
    QueryDispatcher.handleServerAction({
      type: QueryConstants.RECEIVED_DESTROYED_QUERY,
      id: id
    });
  }

};
