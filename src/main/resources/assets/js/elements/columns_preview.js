/** @jsx React.DOM */
var React = require('react'),

    // Partials
    Columns       = require('./columns');

var ColumnSelector = React.createClass({
  displayName: 'ColumnSelector',

  getInitialState: function() {
    return { model: null };
  },

  componentDidMount: function() {
    Mediator.on('newModel', function(model) {
      this.setState({ model: model });
    }.bind(this));
  },

  render: function () {
    return (
      <div className="row columns-row">
        <div className="col-sm-12 column-selector">
          <Columns model={this.state.model} />
        </div>
      </div>
    );
  }
});

module.exports = ColumnSelector;
