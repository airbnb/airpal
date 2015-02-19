/**
 * UserStore
 */

var BaseStore   = require('./BaseStore');
var AppDispatcher  = require('../dispatchers/AppDispatcher');
var UserConstants   = require('../constants/UserConstants');

/* ApiUtils */
var RunApiUtils = require('../utils/RunApiUtils');

var _ = require('lodash');

/**
 * User object
 */
var defaultUser = {
  name: 'unknown',
  executionPermissions: {
    accessLevel: 'default',
    canCreateCsv: false,
    canCreateTable: false
  }
};

var _user = _.extend({}, defaultUser);

/**
 * Adds the user to the user object
 * @param {object} raw user object
 */
function _addUser(user) {
  _user = user;
}

class UserStoreClass extends BaseStore {
  /**
   * Get the current user
   * @return {object} the user object
   */
  getCurrentUser() {
    return _user;
  }
}

var UserStore = new UserStoreClass();

UserStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case UserConstants.RECEIVED_USER_INFO:
      _addUser(action.user);

      // Emit the other changes
      UserStore.emitChange('add');
      UserStore.emitChange('change');

      // Now fetch queries for that user.
      RunApiUtils.fetchForUser(UserStore.getCurrentUser());
      break;

    default:
      // do nothing
  }

});

module.exports = UserStore;
