/** @jsx React.DOM */
var React = require('react'),
    _     = require('lodash'),
    Tab   = require('./tab');

var TabbedArea = React.createClass({
  displayName: 'TabbedArea',

  propTypes: {
    name: React.PropTypes.string.isRequired,
    onTabChange: React.PropTypes.func.isRequired,
    selectedTab: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    var localSelectedTab;

    // Check or the selected tab is already in localStorage
    if( Modernizr.localstorage ) {
      localSelectedTab = localStorage.getItem('current-tab-' + this.props.name);
    }

    return { selectedTab: localSelectedTab || this.props.selectedTab };
  },

  handleClick: function(idx, component, $event) {
    $event.preventDefault();

    // Store the current selected tab in localStorage
    if( Modernizr.localstorage ) {
      localStorage.setItem('current-tab-' + this.props.name, component.props.name);
    }

    // Change the current state and communicate the changes
    this.setState({ selectedTab: component.props.name });
    this.props.onTabChange(component);
  },

  componentWillReceiveProps: function() {

    // Make sure to use the localStorage state if it's defined
    if( Modernizr.localstorage && localStorage.getItem('current-tab-' + this.props.name ) ) {
      this.setState({
        selectedTab: localStorage.getItem('current-tab-' + this.props.name)
      });
    }
  },

  render: function () {
    return (
      <div className="col-sm-12 tabable-area">
        <ul className="nav nav-tabs" role="tablist">{this._renderTabs()}</ul>
        <div className="tab-content">{this._renderPanes()}</div>
      </div>
    );
  },

  /* Internal Helpers ------------------------------------------------------- */
  _renderTabs: function() {
    return _.map(this.props.children, function(component, idx, collection) {

      // Check or this element should be active
      active = this.state.selectedTab.toLowerCase() === component.props.name.toLowerCase()

      // Build the new tab
      return <Tab key={idx} name={component.props.name} onClick={this.handleClick.bind(this, idx, component)} isActive={active} />
    }.bind(this));
  },

  _renderPanes: function() {
    return _.map(this.props.children, function(component) {

      // Set the selected tab for the component
      component.props.selectedTab = this.state.selectedTab;

      // Return the component to be rendered
      return component;
    }.bind(this));
  }
});

module.exports = TabbedArea;
