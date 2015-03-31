import FQN from '../utils/fqn';
import TableActions from '../actions/TableActions';
import _ from 'lodash';
import alt from '../alt';

class TableStore {
  constructor() {
    this.bindListeners({
      onAddTable: TableActions.ADD_TABLE,
      onRemoveTable: TableActions.REMOVE_TABLE,
      onSelectTable: TableActions.SELECT_TABLE,
      onUnselectTable: TableActions.UNSELECT_TABLE,
      onSelectPartition: TableActions.SELECT_PARTITION,
      onUnselectPartition: TableActions.UNSELECT_PARTITION,
      onFetchTables: TableActions.FETCH_TABLES,
      onSetTableColumnWidth: TableActions.SET_TABLE_COLUMN_WIDTH,
      onReceivedTableData: TableActions.RECEIVED_TABLE_DATA,
      onReceivedPartitionData: TableActions.RECEIVED_PARTITION_DATA
    });

    this.exportPublicMethods({
      getActiveTable: this.getActiveTable,
      getAll: this.getAll,
      containsTable: this.containsTable
    });

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
    table.activePartition = null;

    this.activeTable = null;
  }

  markActive(name) {
    // Unmark the whole collection first
    this.unmarkActiveTables()

    // Mark the table as active
    let table = this.getByName(name);

    if (!table) {
      return;
    }

    table.active = true;
    this.activeTable = table;
  }

  markActivePartition(table, partition) {
    const table = this.getByName(table);
    if (table && !!partition) {
      table.activePartition = partition;
    }
  }

  unmarkActivePartition(tableName, partition) {
    const table = this.getByName(tableName);
    if (table && table.activePartition == partition) {
      table.activePartition = null;
      table.data = table.defaultData;
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

    TableActions.fetchTable(table);
  }

  onRemoveTable(name) {
    let table = this.getByName(name);

    if (table === undefined) {
      return;
    }

    if (table.activePartition) {
      table.activePartition = null;
    }

    this.unmarkActiveTables();

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

  onSelectPartition(data) {
    if (!data || !data.partition || !data.table) {
      return;
    }

    const {partition, table: tableName} = data;
    const [name, value] = partition.split('=');
    const table = this.getByName(tableName);

    if (!table) {
      return;
    }

    TableActions.fetchTablePreview(table, name, value);

    this.markActivePartition(tableName, partition);
  }

  onUnselectPartition(data) {
    if (!data || !data.partition || !data.table) {
      return;
    }

    const {partition, table} = data;
    const [name, value] = partition.split('=');

    this.unmarkActivePartition(table, partition);
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

    this.markMostRecentPartitionAsActive(table);
  }

  markMostRecentPartitionAsActive(table) {
    // We special case common date partitions for usability.
    let datePartition = null;

    if (!table || !table.partitions || _.isEmpty(table.partitions)) {
      return;
    }

    _.first(table.partitions, function(partition) {
      if (partition.name === 'ds') {
        datePartition = 'ds';
        return true;
      } else if (partition.name === 'd') {
        datePartition = 'd';
        return true;
      }
    });

    if (datePartition != null) {
      const datePartitions = _.where(table.partitions, { name: datePartition });
      const recentPartitions = _.sortBy(datePartitions, (partition) => partition.value);
      const recentPartition = _.last(recentPartitions);
      const recentPartitionStr = [recentPartition.name, recentPartition.value].join('=');

      table.activePartition = recentPartitionStr;

      this.onSelectPartition({
        table: table.name,
        partition: recentPartitionStr,
      });
    }
  }

  onFetchTables(tables) {
    this.tables = tables;
  }

  onReceivedPartitionData({ table: refTable, partition: {name, value}, data }) {
    const table = this.getByName(refTable.name);

    if (table === undefined || table.activePartition !== [name, value].join('=')) {
      return;
    }

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

  getAll() {
    return this.tables;
  }

  getActiveTable() {
    return this.getState().activeTable;
  }

  containsTable(name) {
    let { tables } = this.getState();

    return !!_.find(tables, { name: name });
  }
}

export default alt.createStore(TableStore, 'TableStore');
