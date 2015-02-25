import FQN from '../utils/fqn';
import TableActions from '../actions/TableActions';
import TableApiUtils from '../utils/TableApiUtils';
import _ from 'lodash';
import alt from '../alt';

class TableStore {
  constructor() {
    this.bindActions(TableActions);

    this.tables = [];
    this.activeTable = null;
  }

  getByName(name) {
    if (_.isEmpty(this.tables)) {
      return undefined;
    }

    return _.find(this.tables, { name });
  }

  getPartitionByValue(value) {
    const table = this.activeTable;

    if (_.isEmpty(table) || _.isEmpty(table.partitions)) {
      return undefined;
    }

    return _.find(table.partitions, { value });
  }

  unmarkActiveTables() {
    this.tables.forEach((table) => {
      if (table.active) {
        // Change the active state of the table
        table.active = false;
      }
    });

    this.activeTable = null;
  }

  unmarkActive(name) {
    let table = this.getByName(name);

    if (table === undefined) {
      return;
    }

    table.active = false;

    this.activeTable = null;
  }

  markActive(name) {
    // Unmark the whole collection first
    this.unmarkActiveTables()

    // Mark the table as active
    let table = this.getByName(name);
    table.active = true;

    this.activeTable = table;
  }

  markActivePartition(partition) {
    if (this.activeTable !== null) {
      this.activeTable.activePartition = partition;
    }
  }

  unmarkActivePartition() {
    if (this.activeTable !== null) {
      this.activeTable.activePartition = null;
      this.activeTable.data = this.activeTable.defaultData;
    }
  }

  onAddTable(table) {
    if (this.getByName(table.name) !== undefined) {
      return;
    }

    // Unmark the whole collection
    this.unmarkActiveTables();

    // Enrich the table with some extra data (active status and url)
    table = _.extend(table, {
      active: true,
      url: `./api/table/${FQN.schema(table.name)}/${FQN.table(table.name)}`,
      partitions: [],
    });

    // Add the table to the collection
    this.tables.push(table);

    // Fetch the data from the new table
    TableApiUtils.fetchTableData(table).then(
      ({table, columns, data, partitions}) => {
        TableActions.receivedTableData(table, columns, data, partitions);
      }
    );
  }

  onRemoveTable(name) {
    let table;

    if (this.getByName(name) === undefined) {
      return;
    }

    // Remove the table from the collection
    this.tables = _.reject(this.tables, { name });

    // Check or we can make an other table active
    if (this.tables.length > 0) {
      table = _.first(this.tables);
      this.markActive(table.name);
    }
  }

  onSelectTable(name) {
    this.markActive(name);
  }

  onUnselectTable(name) {
    this.unmarkActive(name);
  }

  onSelectPartition(partition) {
    console.log('partition selected', partition, arguments);
    if (!partition) {
      return;
    }

    const [name, value] = partition.split('=');

    this.markActivePartition(partition);

    TableApiUtils.getTablePreviewData(
      this.activeTable,
      {name, value});
  }

  onUnselectPartition(partition) {
    console.log('partition unselected', partition, arguments);
    this.unmarkActivePartition(partition);
  }

  onReceivedTableData({ table: refTable, columns, data, partitions }) {
    // Get the right table first
    let table = this.getByName(refTable.name);

    if (table === undefined) {
      return;
    }

    // Add the changed data to the table
    table = _.extend(table, {
      columns: columns,
      data: data,
      partitions: partitions.map(function(partition) {
        return _.extend({}, partition, {
          partitionValue: [partition.name, partition.value].join('='),
        });
      }),
      columnWidths: columns.map(() => 120),
      defaultData: data,
    });

    if (!_.isEmpty(partitions)) {
      this.markActivePartition();
    }
  }

  onReceivedPartitionData({ table: refTable, partition: {name, value}, data }) {
    const table = this.getByName(refTable.name);
    console.log('onReceivedPartitionData triggered', refTable, table, refTable.activePartition);

    if (table === undefined || table.activePartition !== [name, value].join('=')) {
      return;
    }

    console.log('onReceivedPartitionData actually triggered');

    _.extend(table, {
      data: data,
    });
  }

  onSetTableColumnWidth({ columnIdx, width }) {
    let table = this.activeTable;

    if (table === undefined) {
      return;
    }

    table.columnWidths[columnIdx] = width;
  }

  static getActiveTable() {
    return this.getState().activeTable;
  }

  static containsTable(name) {
    let { tables } = this.getState();

    return !!_.find(tables, { name: name });
  }
}

export default alt.createStore(TableStore, 'TableStore');
