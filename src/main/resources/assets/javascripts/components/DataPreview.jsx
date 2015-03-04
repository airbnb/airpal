import React from 'react';
import { Table, Column } from 'fixed-data-table';
import _ from 'lodash';
import FQN from '../utils/fqn';
import TableStore from '../stores/TableStore';
import TableActions from '../actions/TableActions';
import UpdateWidthMixin from '../mixins/UpdateWidthMixin';

let isColumnResizing = false;

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
}

function cellRenderer(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
  return (
    <span
      className="text-overflow-ellipsis"
      style={{width: width}}>{cellData}</span>
  );
}

function getColumns(columns, widths) {
  return columns.map(function(column, i) {
    return (
      <Column
        label={column.name}
        width={widths[i]}
        dataKey={i}
        key={i}
        isResizable={true}
        cellRenderer={cellRenderer}
        minWidth={80}
        />
    );
  });
}

let DataPreview = React.createClass({
  displayName: 'DataPreview',
  mixins: [UpdateWidthMixin],

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    TableStore.listen(this._onChange);
  },

  componentWillUnmount() {
    TableStore.unlisten(this._onChange);
  },

  render() {
    if( this.state.table && this.state.table.data ) {
      return this._renderColumns();
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderEmptyMessage() {
    return (
      <div className="panel-body text-light text-center">
        <p>Please select a table.</p>
      </div>
    )
  },

  _renderColumns() {
    return (
      <div className='flex flex-column airpal-table'>
        <div className='editor-menu'>
          <strong>{this.state.table && this.state.table.name}</strong>
        </div>
        <Table
          headerHeight={25}
          rowHeight={40}
          rowGetter={this.rowGetter}
          rowsCount={this.state.table.data.length}
          width={this.props.tableWidth}
          maxHeight={this.props.tableHeight - 39}
          isColumnResizing={isColumnResizing}
          onColumnResizeEndCallback={this._onColumnResizeEndCallback}>
          {getColumns(this.state.table.columns, this.state.table.columnWidths)}
        </Table>
      </div>
    );
  },

  rowGetter(rowIndex) {
    return this.state.table.data[rowIndex];
  },

  _enhancedColumns() {
    return _.map(this.state.table.columns, function(column) {
      return column.name;
    });
  },

  _enhancedData() {
    return _.map(this.state.table.data, function(item) {
      return _.transform(item, function(result, n, key) {
        let text = _.isBoolean(n) ? n.toString() : n;
        result[this.state.table.columns[key].name] = text;
      }.bind(this));
    }.bind(this));
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  },

  _onColumnResizeEndCallback(newColumnWidth, dataKey) {
    isColumnResizing = false;
    TableActions.setTableColumnWidth(dataKey, newColumnWidth);
  }
});

export default DataPreview;
