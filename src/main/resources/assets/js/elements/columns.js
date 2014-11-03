/** @jsx React.DOM */
var React = require('react'),
    _     = require('lodash'),

    // Partials
    Column = require('./column');

var Columns = React.createClass({
  displayName: 'Columns',

  render: function () {
    if( this.props.model && this.props.model.columns ) {
      return this._renderColumns(this.props.model.columns);
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
        <Column key={idx} name={name} type={object.type} partition={object.partition} />
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
  }
});

module.exports = Columns;
