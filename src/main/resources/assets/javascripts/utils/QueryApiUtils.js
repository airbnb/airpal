/**
 * QueryApiUtils
 */

/* Actions */
var QueryActions = require('../actions/QueryActions');

/* Helpers */
var _ = require('lodash');

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

  fetchUserQueries: function(user) {
    $.ajax({
      type: 'GET',
      url: './api/users/' + user.name + '/queries',
      contentType: 'application/json',

      success: function(results, status, xhr) {
        if ( _.isEmpty(results) ) return;

        // Add each query to the collection
        QueryActions.receivedQueries(results);
      }
    });
  },

  createQuery: function(data) {
    $.ajax({
      type: 'POST',
      url: './api/query/saved',
      data: data,

      success: function(uuid) {
        // TODO: currently the API only returns the uuid, but I also want the
        // name and the description. So we're merging the uuid into the data
        // object
        var query = _.extend({}, data, {uuid: uuid});
        QueryActions.receivedQuery(query);
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
