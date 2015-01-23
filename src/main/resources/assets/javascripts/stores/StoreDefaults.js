/**
 * StoreDefaults
 */

var StoreDefaults = {
  // The collection holds the data for the store
  collection: [],

  // Emit the changes with the eventemitter
  emitChange: function(eventName, options) {
    this.emit(eventName, options);
  },

  // Creates an event listener for a specific event
  // @param eventName {string} event name to listen to
  // @param callback {function} event callback
  addStoreListener: function(eventName, callback) {
    this.on(eventName, callback);
  },


  // Removes a specific event listener
  // @param eventName {string} event name to remove
  // @param callback {function} event callback
  removeStoreListener: function(eventName, callback) {
    this.removeListener(eventName, callback);
  }
};

module.exports = StoreDefaults;