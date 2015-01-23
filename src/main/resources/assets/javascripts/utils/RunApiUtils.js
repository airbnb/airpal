/**
 * RunApiUtils
 */

/* Actions */
var RunActions = require('../actions/RunActions');

/* Helpers */
var _ = require('lodash');

module.exports = {
  execute: function(query) {
    $.ajax({
      type: 'PUT',
      url: './api/execute',

      success: function() {
        console.log(arguments);
        // RunActions.receivedQuery(query);
      },

      error: function() {
        console.log(arguments);
      }
    });
  }
};