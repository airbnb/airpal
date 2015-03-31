import alt from '../alt';
import TableApiUtils from '../utils/TableApiUtils';
import logError from '../utils/logError'

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

  fetchTable(table) {
    // Fetch the data from the new table
    TableApiUtils.fetchTableData(table).then(
      ({table, columns, data, partitions}) => {
        this.actions.receivedTableData(table, columns, data, partitions);
      }
    ).catch(logError);
  }

  fetchTables() {
    TableApiUtils.fetchTables().then((tables) => {
      this.dispatch(tables);
    }).catch(logError);
  }

  fetchTablePreview(table, name, value) {
    TableApiUtils.fetchTablePreviewData(table, {name, value}).then(
      ({table, partition, data}) => {
        this.actions.receivedPartitionData({table, partition, data});
      }
    ).catch(logError);
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
