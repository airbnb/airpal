import alt from '../alt';

class TableActions {
  constructor() {
    this.generateActions(
      'addTable',
      'removeTable',
      'selectTable',
      'unselectTable',
      'selectPartition',
      'unselectPartition'
    );
  }

  setTableColumnWidth(columnIdx, width) {
    this.dispatch({ columnIdx, width });
  }

  receivedTableData(table, columns, data, partitions) {
    this.dispatch({ table, columns, data, partitions });
  }

  receivedPartitionData({table, partition, data}) {
    this.dispatch({ table, partition, data });
  }
}

export default alt.createActions(TableActions);
