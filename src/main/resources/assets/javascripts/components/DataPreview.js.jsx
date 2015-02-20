/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var _       = require('lodash')
    FQN     = require('../utils/fqn'),
    Griddle = require('griddle-react');

/* Stores */
var TableStore = require('../stores/TableStore');

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
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
      <div className="row" className="data-preview data-preview-wrapper">
        <Griddle columns={this._enhancedColumns()} results={this._enhancedData()} />
      </div>
    );
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
