/** @jsx React.DOM */
var React = require('react'),
    _     = require('lodash');

var MetaDataPreview = React.createClass({
  displayName: 'MetaDataPreview',

  getInitialState: function() {
    return { model: null };
  },

  componentDidMount: function() {
    Mediator.on('newModel', function(model) {
      this.setState({ model: model });
    }.bind(this));
  },

  render: function () {
    if( !_.isEmpty(this.state.model) ) {
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
          <p><strong>Table name: </strong> {this.state.model.name}</p>
        </div>
      </div>
    );
  }
});

module.exports = MetaDataPreview;
