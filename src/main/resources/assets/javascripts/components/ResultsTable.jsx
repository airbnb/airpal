import React from 'react';
import { Table, Column } from 'fixed-data-table';
import _ from 'lodash';
import FQN from '../utils/fqn';
import ResultsPreviewStore from '../stores/ResultsPreviewStore';
import TableActions from '../actions/TableActions';
import UpdateWidthMixin from '../mixins/UpdateWidthMixin';

// State actions
function getStateFromStore() {
  return {
    query: ResultsPreviewStore.getPreviewQuery(),
    preview: ResultsPreviewStore.getResultsPreview()
  };
}

function cellRenderer(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
  return (
    <span
      className="text-overflow-ellipsis"
      style={{width: width}}>{cellData}</span>
  );
}

function getColumns(columns, width) {
  return columns.map(function(column, i) {
    return (
      <Column
        label={column}
        width={width}
        dataKey={i}
        key={i}
        cellRenderer={cellRenderer}
        minWidth={80}
        />
    );
  });
}

let ResultsTable = React.createClass({
  displayName: 'ResultsTable',
  mixins: [UpdateWidthMixin],

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    ResultsPreviewStore.listen(this._onChange);
  },

  componentWillUnmount() {
    ResultsPreviewStore.unlisten(this._onChange);
  },

  render() {
    if( this.state.preview && this.state.preview.data ) {
      return this._renderColumns();
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderEmptyMessage() {
    return (
      <div className="panel-body text-light text-center">
        <p>Please make a query.</p>
      </div>
    )
  },

  _renderColumns() {
    return (
      <div className='flex flex-column airpal-table'>
        <div className='editor-menu'>
          <strong>{this.state.query}</strong>
        </div>
        <Table
          headerHeight={25}
          rowHeight={40}
          rowGetter={this.rowGetter}
          rowsCount={this.state.preview.data.length}
          width={this.props.tableWidth}
          maxHeight={this.props.tableHeight - 39}>
          {getColumns(this.state.preview.columns, 120)}
        </Table>
      </div>
    );
  },

  rowGetter(rowIndex) {
    return this.state.preview.data[rowIndex];
  },

  _enhancedColumns() {
    return _.map(this.state.preview.columns, function(column) {
      return column.name;
    });
  },

  _enhancedData() {
    return _.map(this.state.preview.data, function(item) {
      return _.transform(item, function(result, n, key) {
        let text = _.isBoolean(n) ? n.toString() : n;
        result[this.state.preview.columns[key].name] = text;
      }.bind(this));
    }.bind(this));
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  },

});

export default ResultsTable;
