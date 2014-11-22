/**
 * QueryApiUtils
 */

var QueryActions = require('../actions/UserActions');

module.exports = {

  getQuery: function(id) {
    $.ajax({
      type: 'GET',
      url: './api/queries/' + id,

      success: function(query) {
        QueryActions.receivedQuery(query);
      }
    });
  },

  getAllQueries: function() {
    $.ajax({
      type: 'GET',
      url: './api/queries',

      success: function(queries) {
        QueryActions.receivedQueries(queries);
      }
    });
  },

  createQuery: function(data) {
    $.ajax({
      type: 'POST',
      url: './api/queries',
      data: data,

      success: function(query) {
        QueryActions.receivedQuery(query);
      }
    });
  },

  updateQuery: function(id, data) {
    $.ajax({
      type: 'PATCH',
      url: './api/queries/' + id,
      data: data,

      success: function(query) {
        QueryActions.receivedUpdatedQuery(id, query);
      }
    });
  },

  destroyQuery: function(id) {
    $.ajax({
      type: 'DELETE',
      url: './api/queries/' + id,

      success: function() {
        QueryActions.receivedDestroyedQuery(id);
      }
    });
  }
};