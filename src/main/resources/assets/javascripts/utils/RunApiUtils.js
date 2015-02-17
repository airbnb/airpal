/**
 * RunApiUtils
 */

/* Actions */
var RunActions = require('../actions/RunActions');

/* Helpers */
var _ = require('lodash');

module.exports = {
  execute: function(query, tmpTable) {
    $.ajax({
      type: 'PUT',
      url: './api/execute',

      contentType: 'application/json',
      data: JSON.stringify({
        query: query,
        tmpTable: tmpTable
      }),

      success: function(runObject, status, xhr) {
        RunActions.addRun(runObject);
      }
    });
  },

  fetch: function(user) {
    $.ajax({
      type: 'GET',
      url: './api/users/' + user.name + '/active-queries',
      contentType: 'application/json',

      success: function(results, status, xhr) {
        if ( _.isEmpty(results) ) return;

        // Add each run to the collection
        RunActions.addMultipleRuns(results);
      }
    });
  }
};