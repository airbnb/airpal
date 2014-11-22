/*
 * QueryActions
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

  removeTable: function(id) {
    TableDispatcher.handleViewAction({
      type: TableConstants.REMOVE_TABLE
      id: id
    });
  }

};