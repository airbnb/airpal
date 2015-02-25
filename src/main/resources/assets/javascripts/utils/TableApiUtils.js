import xhr from './xhr';

const fetchColumData = (table) => xhr(`${table.url}/columns`);

const fetchPreviewData = (table, partition = {}) => {
  return xhr(`${table.url}/preview`, {
    partitionName: partition.name,
    partitionValue: partition.value
  });
};

const fetchPartitionData = (table) => xhr(`${table.url}/partitions`);

export default {
  fetchTableData(table) {
    return Promise.all([
      fetchColumData(table),
      fetchPreviewData(table),
      fetchPartitionData(table)
    ]).then(([columns, data, partitions]) => {
      return { table, columns, data, partitions };
    });
  },

  fetchTablePreviewData(table, partition) {
    return fetchPreviewData.then((data) => {
      return { table, partition, data };
    });
  }
};
