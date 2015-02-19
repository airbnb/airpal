/** @jsx React.DOM */
var React = require('react');

/* FixedDataTable */
var { Table, Column } = require('fixed-data-table');

/* Helpers */
var _       = require('lodash');
var FQN     = require('../utils/fqn');;

/* Stores */
var TableStore = require('../stores/TableStore');

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
}

function getColumns(columns) {
  return columns.map(function(column, i) {
    return (
      <Column
        label={column.name}
        width={100}
        dataKey={i}
        key={i}
        />
    );
  });
}

var DataPreview = React.createClass({
  displayName: 'DataPreview',

  getInitialState: function() {
    return getStateFromStore();
  },

  componentDidMount: function() {
    TableStore.addStoreListener('select', this._onChange);
    TableStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount: function() {
    TableStore.removeStoreListener('select');
    TableStore.removeStoreListener('change');
  },

  render: function () {
    if( this.state.table && this.state.table.data ) {
      return this._renderColumns();
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderEmptyMessage: function() {
    return (
      <div className="alert alert-warning">
        <p>There is no table selected. Please select (another) table to view the inner data.</p>
      </div>
    )
  },

  _renderColumns: function() {
    return (
      <Table
        rowHeight={40}
        rowGetter={this.rowGetter}
        rowsCount={this.state.table.data.length}
        width={960}
        maxHeight={250}
        ownerHeight={250}
        headerHeight={40}>
        {getColumns(this.state.table.columns)}
      </Table>
    );
  },

  rowGetter: function(rowIndex) {
    return this.state.table.data[rowIndex];
  },

  _enhancedColumns: function() {
    return _.map(this.state.table.columns, function(column) {
      return column.name;
    });
  },

  _enhancedData: function() {
    return _.map(this.state.table.data, function(item) {
      return _.transform(item, function(result, n, key) {
        var text = _.isBoolean(n) ? n.toString() : n;
        result[this.state.table.columns[key].name] = text;
      }.bind(this));
    }.bind(this));
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = DataPreview;
