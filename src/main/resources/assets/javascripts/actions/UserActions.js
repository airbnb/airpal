/*
 * UserActions
 */

var AppDispatcher = require('../AppDispatcher');
var UserConstants = require('../constants/UserConstants');

module.exports = {

  receivedCurrentUser: function(user) {
    AppDispatcher.handleServerAction({
      type: UserConstants.RECEIVED_USER_INFO,
      user: user
    });
  }

};