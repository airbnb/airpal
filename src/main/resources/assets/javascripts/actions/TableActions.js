/*
 * TableActions
 */

var AppDispatcher = require('../dispatchers/AppDispatcher');
var TableConstants = require('../constants/TableConstants');

module.exports = {

  // - ViewActions --------------------------------------------------------- //
  addTable: function(table) {
    AppDispatcher.handleViewAction({
      type: TableConstants.ADD_TABLE,
      table: table
    });
  },

  removeTable: function(name) {
    AppDispatcher.handleViewAction({
      type: TableConstants.REMOVE_TABLE,
      name: name
    });
  },

  selectTable: function(name) {
    AppDispatcher.handleViewAction({
      type: TableConstants.SELECT_TABLE,
      name: name
    });
  },

  // - ServerActions ------------------------------------------------------- //
  receivedTableData: function(table, columns, data, partitions) {
    AppDispatcher.handleServerAction({
      type: TableConstants.RECEIVED_TABLE_DATA,
      table: table,
      columns: columns,
      data: data,
      partitions: partitions,
    });
  }

};
