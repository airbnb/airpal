/** @jsx React.DOM */
var React = require('react');

/* Components */
var Column = require('./Column.react');

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

var Columns = React.createClass({
  displayName: 'Columns',

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
    if( this.state.table && this.state.table.columns ) {
      return this._renderColumns(this.state.table.columns);
    } else {
      return this._renderEmptyMessage();
    }
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderColumns: function(collection) {
    var columns;

    // Get all available columns
    columns = _.map(collection, function(object, idx) {

      // Capitalize the name of the object
      var name = this._capitalize(object.name);

      // Return the template
      return (
        <Column key={idx} name={name} type={object.type} />
      );
    }.bind(this));

    // Render the template
    return (<div className="row">{columns}</div>);
  },

  _renderEmptyMessage: function() {
    return (
      <div className="alert alert-warning">
        <p>There are no columns, or there is no table selected. Please selected (another) table.</p>
      </div>
    )
  },

  _capitalize: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = Columns;