/*
 * UserActions
 */

var AppDispatcher = require('../AppDispatcher');
var UserConstants = require('../constants/UserConstants');

module.exports = {

  get: function(rawUserInfo) {
    AppDispatcher.handleServerAction({
      type: UserConstants.RECEIVE_USER_INFO,
      rawUserInfo: rawUserInfo
    });
  }

};