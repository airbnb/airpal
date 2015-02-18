/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var _     = require('lodash');

var Column = React.createClass({
  displayName: 'Column',

  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },

  render: function () {

    // Define the output value
    var value = this.props.partition ? '(Partition)' : '(' + this.props.type + ')';

    // Return the template
    return (
      <div className="col-sm-3">
        <div className="panel panel-default panel-compressed">

          <div className="panel-body">
            <strong>{this.props.name} </strong> {value}
          </div>

        </div>
      </div>
    );
  }
});

module.exports = Column;
