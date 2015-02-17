/**
 * TableApiUtils
 */

var TableActions = require('../actions/TableActions');

// Fetch the column data
function fetchColumData(table) {
  return $.ajax({
    type: 'GET',
    url: table.url + '/columns'
  });
}

function fetchPreviewData(table) {
  return $.ajax({
    type: 'GET',
    url: table.url + '/preview'
  });
}

module.exports = {

  getTableData: function(table) {
    $.when(fetchColumData(table), fetchPreviewData(table))
      .then(function(columnArr, dataArr) {
        TableActions.receivedTableData(table, columnArr[0], dataArr[0]);
      });
  }

};