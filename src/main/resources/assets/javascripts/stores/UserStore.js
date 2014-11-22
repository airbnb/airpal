/**
 * UserStore
 */

var AppDispatcher = require('../AppDispatcher');
var UserConstants = require('../constants/UserConstants');

/* Store helpers */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

/**
 * User object
 */
var defaultUser = {
  name: '',
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
function _addUser(rawUserInfo) {
  _user = rawUserInfo;
}

var UserStore = assign({}, EventEmitter.prototype, {

  emitChange: function(eventName) {
    this.emit(eventName);
  },

  /**
   * Creates an event listener for a specific event
   * @param {string} event name to listen to
   * @param {function} event callback
   */
  addStoreListener: function(eventName, callback) {
    this.on(eventName, callback);
  },

  /**
   * Removes a specfik event listener
   * @param {string} event name to remove
   * @param {function} event callback
   */
  removeStoreListener: function(eventName, callback) {
    this.removeListener(eventName, callback);
  },

  /**
   * Get the current user
   * @return {object} the user object
   */
  getCurrentUser: function() {
    return _user;
  }

});

UserStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case UserConstants.RECEIVE_USER_INFO:
      _addUser(action.rawUserInfo);
      UserStore.emitChange('add');
      break;

    default:
      // do nothing
  }

});

module.exports = UserStore;
