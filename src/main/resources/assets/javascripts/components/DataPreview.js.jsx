/** @jsx React.DOM */
var React = require('react');

/* FixedDataTable */
var { Table, Column } = require('fixed-data-table');

/* Helpers */
var _       = require('lodash');
var FQN     = require('../utils/fqn');;

/* Stores */
var TableStore = require('../stores/TableStore');

/* Mixins */
var UpdateWidthMixin = require('../mixins/UpdateWidthMixin');

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
        width={120}
        dataKey={i}
        key={i}
        />
    );
  });
}

var DataPreview = React.createClass({
  displayName: 'DataPreview',

  mixins: [UpdateWidthMixin],

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    TableStore.addStoreListener('select', this._onChange);
    TableStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount() {
    TableStore.removeStoreListener('select');
    TableStore.removeStoreListener('change');
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
      <div className="alert alert-warning">
        <p>There is no table selected. Please select (another) table to view the inner data.</p>
      </div>
    )
  },

  _renderColumns() {
    return (
      <div>
        {/*
          Need to make sure to wrap `Table` in a parent element so we can
          compute the natural width of the component.
        */}
        <Table
          rowHeight={40}
          rowGetter={this.rowGetter}
          rowsCount={this.state.table.data.length}
          width={this.state.width}
          maxHeight={230}
          ownerHeight={230}
          headerHeight={40}>
          {getColumns(this.state.table.columns)}
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
        var text = _.isBoolean(n) ? n.toString() : n;
        result[this.state.table.columns[key].name] = text;
      }.bind(this));
    }.bind(this));
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  }
});

module.exports = DataPreview;
