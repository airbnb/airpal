/** @jsx React.DOM */

/**
 * Dependencies
 */
var React = require('react');
var _ = require('lodash');

/**
 * Components
 */
var Column = require('./Column.react');

/**
 * Stores
 */
var TableStore = require('../stores/TableStore');


function getStateFromStore() {
  return {
    table: TableStore.getActiveTable()
  };
}

var ColumnsPreview = React.createClass({
  displayName: 'Columns',

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

  _onChange() {
    this.setState(getStateFromStore());
  },

  _renderColumns(collection) {
    var partitions = _.chain(collection).where({partition: true}).sortBy('name').value();
    var normalCols = _.chain(collection).where({partition: false}).sortBy('name').value();

    var columns = _.chain(partitions.concat(normalCols)).reduce(function(m, col) {
      var reuseGroup = (m.length > 0) && (m[m.length - 1].length < 4);
      var group = reuseGroup ? m[m.length - 1] : [];
      var val;

      group.push(<Column key={col.name} name={col.name} type={col.type} />);

      if (!reuseGroup) {
        m.push(group);
      }

      return m;
    }, []).map(function(col, i) {
      return (<div className="row" key={'col-row-' + i}>{col}</div>);
    }).value();

    // Render the template
    return (<div>{columns}</div>);
  },

  _renderEmptyMessage() {
    return (
      <div className="alert alert-warning">
        <p>There are no columns, or there is no table selected. Please select (another) table.</p>
      </div>
    )
  },

  _capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  render() {
    if( this.state.table && this.state.table.columns ) {
      return this._renderColumns(this.state.table.columns);
    } else {
      return this._renderEmptyMessage();
    }
  },
});

module.exports = ColumnsPreview;
