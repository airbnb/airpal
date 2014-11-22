/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var _     = require('lodash');

/* Stores */
var TableStore = require('../stores/TableStore');

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
}

var MetaDataPreview = React.createClass({
  displayName: 'MetaDataPreview',

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
    if( !_.isEmpty(this.state.table) ) {
      return this._renderMetaData();
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderEmptyMessage: function() {
    return (
      <div className="alert alert-warning">
        <p>There is no table selected. Please selected a table to view the meta data.</p>
      </div>
    )
  },

  _renderMetaData: function () {
    return (
      <div className="row">
        <div className="col-sm-12 column-selector">
          <p><strong>Table name: </strong> {this.state.table.name}</p>
        </div>
      </div>
    );
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = MetaDataPreview;