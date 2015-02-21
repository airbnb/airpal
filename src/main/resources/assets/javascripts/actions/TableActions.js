import alt from '../alt';

class TableActions {
  constructor() {
    this.generateActions(
      'addTable',
      'removeTable',
      'selectTable',
      'unselectTable'
    );
  }

  setTableColumnWidth(columnIdx, width) {
    this.dispatch({ columnIdx, width });
  }

  receivedTableData(table, columns, data, partitions) {
    this.dispatch({ table, columns, data, partitions });
  }
}

export default alt.createActions(TableActions);
