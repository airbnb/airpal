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

function fetchPartitionData(table) {
  return $.ajax({
    type: 'GET',
    url: table.url + '/partitions'
  });
}

module.exports = {

  getTableData: function(table) {
    $.when(fetchColumData(table), fetchPreviewData(table), fetchPartitionData(table))
      .then(function(columnArr, dataArr, partitionArr) {
        TableActions.receivedTableData(table, columnArr[0], dataArr[0], partitionArr[0]);
      });
  }

};
