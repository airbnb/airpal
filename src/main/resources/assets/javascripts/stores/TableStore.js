/**
 * TableStore
 */

var BaseStore   = require('./BaseStore');
var AppDispatcher   = require('../dispatchers/AppDispatcher');
var TableConstants  = require('../constants/TableConstants');
var TableApiUtils   = require('../utils/TableApiUtils');

/* Store helpers */
var _ = require('lodash');
var FQN = require('../utils/fqn');

/* Tables */
var _tables = [];

// Adds the table to the collection
// @param {object} the table object
function _addTable(table) {
  if (TableStore.getByName(table.name) !== undefined) {
    return;
  }

  // Unmark the whole collection
  _unMarkActiveTables();

  // Enrich the table with some extra data (active status and url)
  table = _.extend(table, {
    active: true,
    url: './api/table/' + FQN.schema(table.name) + '/' + FQN.table(table.name),
    partitions: [],
  });

  // Add the table to the collection
  _tables.push(table);

  // Fetch the data from the new table
  TableApiUtils.getTableData(table);
}

// Updates a table with the new data
function _updateTableData(table, columns, data, partitions) {

  // Get the right table first
  var table = TableStore.getByName(table.name);
  if( table === undefined ) return;

  // Add the changed data to the table
  table = _.extend(table, {
    columns: columns,
    data: data,
    partitions: partitions,
    columnWidths: columns.map(function(column, i) {
      return 120;
    }),
  });
}

// Removes the table from the collection
// @param {string} the table name
function _removeTable(name) {
  var table;

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
  TableStore.all().forEach(function(table) {
    if (table.active) {
      // Change the active state of the table
      table.active = false;
    }
  });
}

// Marks a table as active
function _markActive(name) {

  // Unmark the whole collection first
  _unMarkActiveTables()

  // Mark the table as active
  var table = TableStore.getByName(name);
  table.active = true;
}

function _unmarkActive(name) {
  var table = TableStore.getByName(name);
  if (table === undefined) {
    return;
  }
  table.active = false;
}

function _setActiveTableColumnWidth(col, width) {
  var table = TableStore.getActiveTable();
  if (table === undefined) {
    return;
  }

  table.columnWidths[col] = width;
}

class TableStoreClass extends BaseStore {

  // Get the table by name
  // @param name {string} the table name
  // @return {object/undefined} the table object
  getByName(name) {
    if (_.isEmpty(_tables)) return undefined;
    return _.find(_tables, { name: name });
  }

  // Alias for the getByName method
  // @param name {string} the table name
  // @return {object/undefined} the table object
  get(name) {
    if (_.isEmpty(_tables)) return undefined;
    return this.getByName(name);
  }

  // Get the active table
  // @return {object/undefined} the active table
  getActiveTable() {
    if (_.isEmpty(_tables)) return undefined;
    return _.find(_tables, { active: true });
  }

  getActiveTableColumnWidths() {
    var activeTable = this.getActiveTable();

    if (!activeTable) {
      return null;
    }

    return activeTable.columnWidths;
  }

  // Get all tables
  // @return {array} all the current tables
  all() {
    return _tables;
  }

  containsTable(name) {
    return !!TableStore.getByName(name);
  }
}

var TableStore = new TableStoreClass();

TableStore.dispatchToken = AppDispatcher.register(function(payload) {
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

    case TableConstants.UNSELECT_TABLE:
      _unmarkActive(action.name);
      TableStore.emitChange('select');
      break;

    case TableConstants.RECEIVED_TABLE_DATA:
      _updateTableData(action.table, action.columns, action.data, action.partitions);
      TableStore.emitChange('change');
      break;

    case TableConstants.SET_TABLE_COLUMN_WIDTH:
      _setActiveTableColumnWidth(action.columnIdx, action.width);
      TableStore.emitChange('change');
      break;

    default:
      // do nothing
  }

});

module.exports = TableStore;
