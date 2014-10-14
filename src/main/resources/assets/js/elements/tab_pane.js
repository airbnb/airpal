/** @jsx React.DOM */
var React = require('react');

var TabPane = React.createClass({
  displayName: 'TabPane',

  propTypes: {
    selectedTab: React.PropTypes.string.isRequired
  },

  render: function () {
    this.classes || (this.classes = {})
    this.classes['tab-pane'] = true
    this.classes['active'] = (this.props.name === this.props.selectedTab);

    return (
      <div className={React.addons.classSet(this.classes)}>{this.props.children}</div>
    );
  }
});

module.exports = TabPane;