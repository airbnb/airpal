/** @jsx React.DOM */
var React = require('react'),
    FQN   = require('../helpers/fqn'),
    _     = require('lodash');

var DataPreview = React.createClass({
  displayName: 'DataPreview',

  getInitialState: function() {
    return { model: null };
  },

  componentDidMount: function() {
    Mediator.on('newModel', function(model) {
      this.setState({ model: model });
    }.bind(this));
  },

  render: function () {
    if( this.state.model && this.state.model.columns && this.state.model.data ) {
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
    if( !this.state.model || !this.state.model.columns ) return;

    var headRows = _.map(this.state.model.columns, function(column, idx) {
      return (<th>{column.name}</th>);
    });

    return headRows;
  },

  _renderBodyRows: function() {
    if( !this.state.model || !this.state.model.data ) return;

    return _.map(this.state.model.data, function(item, idx) {
      var elements;

      // Map all the data in the item
      elements = _.map(item, function(value, key) {
        return(<td>{value}</td>);
      });

      // Return the complete row
      return ( <tr key={idx}>{elements}</tr> );
    });
  }
});

module.exports = DataPreview;
