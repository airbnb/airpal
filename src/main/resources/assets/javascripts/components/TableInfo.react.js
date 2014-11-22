/** @jsx React.DOM */
var React = require('react');

/* Stores */
var TableStore = require('../stores/TableStore');

// State actions
function getStateFromStore() {
  return {
    tables: TableStore.all(),
    activeTable: TableStore.getActiveTable()
  };
}

var TableInfo = React.createClass({
  displayName: 'TableInfo',

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
    return (
      <div>TableInfo</div>
    );
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = TableInfo;