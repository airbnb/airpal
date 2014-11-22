/*
 * UserActions
 */

var UserDispatcher = require('../dispatchers/UserDispatcher');
var UserConstants = require('../constants/UserConstants');

module.exports = {

  receivedCurrentUser: function(user) {
    UserDispatcher.handleServerAction({
      type: UserConstants.RECEIVED_USER_INFO,
      user: user
    });
  }

};