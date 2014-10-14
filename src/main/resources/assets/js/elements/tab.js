/** @jsx React.DOM */
var React = require('react');

var Tab = React.createClass({
  displayName: 'Tab',

  propTypes: {
    isActive: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  render: function() {
    var className = React.addons.classSet({ active: this.props.isActive });
    return (
      <li className={className} onClick={this.props.onClick}>
        <a href="#" title="Switch to tab: {this.props.name}">{this.props.name}</a>
      </li>
    );
  }
});

module.exports = Tab;