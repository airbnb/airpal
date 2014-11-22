/*
 * TableActions
 */

var TableDispatcher = require('../dispatchers/TableDispatcher');
var TableConstants = require('../constants/TableConstants');

module.exports = {

  // - ViewActions --------------------------------------------------------- //
  addTable: function(table) {
    TableDispatcher.handleViewAction({
      type: TableConstants.ADD_TABLE,
      table: table
    });
  },

  removeTable: function(name) {
    TableDispatcher.handleViewAction({
      type: TableConstants.REMOVE_TABLE,
      name: name
    });
  },

  selectTable: function(name) {
    TableDispatcher.handleViewAction({
      type: TableConstants.SELECT_TABLE,
      name: name
    });
  },

  // - ServerActions ------------------------------------------------------- //
  receivedTableData: function(table, columns, data) {
    TableDispatcher.handleServerAction({
      type: TableConstants.RECEIVED_TABLE_DATA,
      table: table,
      columns: columns,
      data: data
    });
  }

};