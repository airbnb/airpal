// Fetch the column data
function fetchColumData(table) {
  return $.ajax({
    type: 'GET',
    url: table.url + '/columns'
  });
}

function fetchPreviewData(table, partition) {
  partition = partition || {};

  return $.ajax({
    type: 'GET',
    url: table.url + '/preview',
    data: {
      partitionName: partition.name,
      partitionValue: partition.value,
    },
  });
}

function fetchPartitionData(table) {
  return $.ajax({
    type: 'GET',
    url: table.url + '/partitions'
  });
}

export default {
  fetchTableData(table) {
    return new Promise((resolve) => {
      $.when(fetchColumData(table), fetchPreviewData(table), fetchPartitionData(table))
        .then(function(columnArr, dataArr, partitionArr) {
          resolve({
            table: table,
            columns: columnArr[0],
            data: dataArr[0],
            partitions: partitionArr[0]
          });
        });
    });
  },

  fetchTablePreviewData(table, partition) {
    return new Promise((resolve) => {
      $.when(fetchPreviewData(table, partition))
        .then(function(dataArr) {
          resolve({table, partition, data: dataArr});
        });
    });
  },
};
