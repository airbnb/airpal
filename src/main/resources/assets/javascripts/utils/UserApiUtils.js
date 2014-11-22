/**
 * UserApiUtils
 */

var UserActions = require('../actions/UserActions');

module.exports = {
  getCurrentUser: function() {
    $.ajax({
      type: 'GET',
      url: './api/user',

      success: function(user) {
        UserActions.receivedCurrentUser(user);
      }
    });
  }
};