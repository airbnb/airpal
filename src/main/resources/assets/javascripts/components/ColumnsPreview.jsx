/** @jsx React.DOM */
var React = require('react');

/* Components */
var Column = require('./Column');

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

var ColumnsPreview = React.createClass({
  displayName: 'Columns',

  getInitialState: function() {
    return getStateFromStore();
  },

  componentDidMount: function() {
    TableStore.addStoreListener('select', this._onChange);
    TableStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount: function() {
    TableStore.removeStoreListener('select', this._onChange);
    TableStore.removeStoreListener('change', this._onChange);
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

    var partitions = _.chain(collection).where({partition: true}).sortBy('name').value(),
        normalCols = _.chain(collection).where({partition: false}).sortBy('name').value();

    columns = _.chain(partitions.concat(normalCols)).reduce(function(m, col) {
      var reuseGroup = (m.length > 0) && (m[m.length - 1].length < 4),
          group = reuseGroup ? m[m.length - 1] : [],
          val;

      group.push(
        <Column
          key={col.name}
          name={col.name}
          type={col.type}
          partition={col.partition} />
      );

      if (!reuseGroup) {
        m.push(group);
      }

      return m;
    }, []).map(function(col, i) {
      return (
        <div className="row" key={'col-row-'+i}>
          {col}
        </div>
      );
    }).value();

    // Render the template
    return (<div className="columns-container">{columns}</div>);
  },

  _renderEmptyMessage: function() {
    return (
      <div className="text-center">
        <p>Please select a table.</p>
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

module.exports = ColumnsPreview;
