import xhr from './xhr';

const fetchColumData = (table) => xhr(`${table.url}/columns`);

const fetchPreviewData = (table, partition = {}) => {
  let url = `${table.url}/preview`;
  if (partition.name && partition.value) {
    url += '?' +
      `partitionName=${partition.name}&` +
      `partitionValue=${partition.value}`;
  }

  return xhr(url);
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
    return fetchPreviewData(table, partition).then((data) => {
      return { table, partition, data };
    });
  },

  fetchTables() {
    return xhr('/api/table?query=a');
  }
};
