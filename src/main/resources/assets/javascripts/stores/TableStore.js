/**
 * TableStore
 */

var StoreDefaults = require('./StoreDefaults');
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

  // Unmark the whole collection
  _unMarkActiveTables();

  // Add the table to the collection
  _tables.push(_.extend(table, { active: true }));
}

// Removes the table from the collection
// @param {string} the table name
function _removeTable(name) {
  if( TableStore.getByName(name) === undefined ) return;

  // Remove the table from the collection
  _tables = _.reject(_tables, { name: name });

  // Check or we can make an other table active
  if( _tables.length > 0 ) {
    table = _.first(_tables);
    _markActive(table.name);
  }
}

// Marks all tables as inactive
function _unMarkActiveTables() {
  table = TableStore.getActiveTable();
  if( !table ) return;

  // Change the active state of the table
  table.active = false;
}

// Marks a table as active
function _markActive(name) {

  // Unmark the whole collection first
  _unMarkActiveTables()

  // Mark the table as active
  table = TableStore.getByName(name);
  table.active = true;
}

var TableStore = assign(StoreDefaults, EventEmitter.prototype, {

  // Get the table by name
  // @param name {string} the table name
  // @return {object/undefined} the table object
  getByName: function(name) {
    if( _.isEmpty(_tables) ) return undefined;
    return _.find(_tables, { name: name });
  },

  // Alias for the getByName method
  // @param name {string} the table name
  // @return {object/undefined} the table object
  get: function(name) {
    if( _.isEmpty(_tables) ) return undefined;
    return this.getByName(name);
  },

  // Get the active table
  // @return {object/undefined} the active table
  getActiveTable: function() {
    if( _.isEmpty(_tables) ) return undefined;
    return _.find(_tables, { active: true });
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
      _removeTable(action.name);
      TableStore.emitChange('remove');
      TableStore.emitChange('change');
      break;

    case TableConstants.SELECT_TABLE:
      _markActive(action.name);
      TableStore.emitChange('select');
      break;

    default:
      // do nothing
  }

});

module.exports = TableStore;
