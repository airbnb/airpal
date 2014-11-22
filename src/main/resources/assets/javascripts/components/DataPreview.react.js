/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var FQN   = require('../utils/fqn');
var _     = require('lodash');

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
        <p>There is no table selected. Please selected (another) table to view the inner data.</p>
      </div>
    )
  },

  _renderColumns: function() {
    return (
      <div className="row" className="data-preview data-preview-wrapper">
        <table className="table table-striped">
          <thead>
            <tr>{this._renderHeaderRows()}</tr>
          </thead>
          <tbody>{this._renderBodyRows()}</tbody>
        </table>
      </div>
    );
  },

  _renderHeaderRows: function() {
    if( !this.state.table || !this.state.table.columns ) return;

    var headRows = _.map(this.state.table.columns, function(column, idx) {
      return (<th>{column.name}</th>);
    });

    return headRows;
  },

  _renderBodyRows: function() {
    if( !this.state.table || !this.state.table.data ) return;

    return _.map(this.state.table.data, function(item, idx) {
      var elements;

      // Map all the data in the item
      elements = _.map(item, function(value, key) {
        return(<td>{value}</td>);
      });

      // Return the complete row
      return ( <tr key={idx}>{elements}</tr> );
    });
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = DataPreview;
