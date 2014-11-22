/**
 * TableStore
 */

var TableDispatcher = require('../dispatchers/TableDispatcher');
var TableConstants = require('../constants/TableConstants');

/* Store helpers */
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

/* Tables */
var _tables = [];

// Adds the table to the collection
// @param {object} the table object
function _addTable(table) {
  if( TableStore.getByName(table.name) !== undefined ) return;
  _tables.push(table);
}

// Removes the table from the collection
// @param {string} the table name
function _removeTable(name) {
  if( TableStore.getByName(name) === undefined ) return;
  _tables = _.reject(_tables, function(table) {
    table.name === name
  });
}

var TableStore = assign({}, EventEmitter.prototype, {

  emitChange: function(eventName) {
    this.emit(eventName);
  },

  /**
   * Creates an event listener for a specific event
   * @param eventName {string} event name to listen to
   * @param callback {function} event callback
   */
  addStoreListener: function(eventName, callback) {
    this.on(eventName, callback);
  },

  /**
   * Removes a specfik event listener
   * @param eventName {string} event name to remove
   * @param callback {function} event callback
   */
  removeStoreListener: function(eventName, callback) {
    this.removeListener(eventName, callback);
  },

  // Get the table by name
  // @param name {string} the table name
  // @return {object/undefined} the table object
  getByName: function(name) {
    return _.find(_tables, { name: name });
  },

  // Alias for the getByName method
  // @param name {string} the table name
  // @return {object/undefined} the table object
  get: function(name) {
    return this.getByName(name);
  },

  // Get all tables
  // @return {array} all the current tables
  all: function() {
    return _tables;
  }
});

TableStore.dispatchToken = TableDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case TableConstants.ADD_TABLE:
      _addTable(action.table);
      TableStore.emitChange('add');
      TableStore.emitChange('change');
      break;

    case TableConstants.REMOVE_TABLE:
      _removeTable(action.id);
      TableStore.emitChange('remove');
      TableStore.emitChange('change');
      break;

    default:
      // do nothing
  }

});

module.exports = TableStore;
