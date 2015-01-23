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

      success: function() {
        console.log('success');
        console.log(arguments);
        // RunActions.receivedQuery(query);
      },

      error: function(xhr, status, error) {
        console.log('error');
        console.log(xhr, status, error);
      }
    });
  }
};