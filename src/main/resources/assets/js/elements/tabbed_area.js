/** @jsx React.DOM */
var React = require('react'),
    _     = require('lodash');

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
        <a href="#">{this.props.name}</a>
      </li>
    );
  }
});

var TabbedArea = React.createClass({
  displayName: 'TabbedArea',

  propTypes: {
    onTabChange: React.PropTypes.func.isRequired,
    selectedTab: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return { selectedTab: this.props.selectedTab };
  },

  handleClick: function(idx, component, $event) {
    $event.preventDefault();

    // Change the current state and communicate the changes
    this.setState({ selectedTab: component.props.name });
    this.props.onTabChange(component);
  },

  render: function () {
    return (
      <div className="col-sm-12 tabable-area">
        <ul className="nav nav-tabs" role="tablist">{this.renderTabs()}</ul>
        <div className="tab-content">{this.props.children}</div>
      </div>
    );
  },

  /* Render out each tab */
  renderTabs: function() {
    return _.map(this.props.children, function(component, idx, collection) {

      // Check or this element should be active
      active = this.state.selectedTab.toLowerCase() === component.props.name.toLowerCase()

      // Build the new tab
      return <Tab key={idx} name={component.props.name} onClick={this.handleClick.bind(this, idx, component)} isActive={active} />
    }.bind(this));
  }
});

module.exports = TabbedArea;
