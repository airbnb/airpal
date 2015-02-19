/**
 * QueryApiUtils
 */

/* Actions */
var QueryActions = require('../actions/QueryActions');

/* Helpers */
var _ = require('lodash');

module.exports = {
  fetchSavedQueries() {
    $.ajax({
      type: 'GET',
      url: './api/query/saved',
      contentType: 'application/json',

      success(results) {
        if (_.isEmpty(results)) return;

        // Add each query to the collection
        QueryActions.receivedQueries(results);
      }
    });
  },

  createQuery(data) {
    $.ajax({
      type: 'POST',
      url: './api/query/saved',
      data: data,

      success(uuid) {
        // TODO: currently the API only returns the uuid, but I also want the
        // name and the description. So we're merging the uuid into the data
        // object
        var query = _.extend({}, data, {uuid: uuid});
        QueryActions.receivedQuery(query);
      }
    });
  },

  destroyQuery(id) {
    $.ajax({
      type: 'DELETE',
      url: './api/queries/' + id,

      success() {
        QueryActions.receivedDestroyedQuery(id);
      }
    });
  }
};
