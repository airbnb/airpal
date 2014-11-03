/** @jsx React.DOM */
var React = require('react'),

    // Elements
    TabbedArea        = require('./tabbed_area'),
    TabPane           = require('./tab_pane');

var Queries = React.createClass({
  displayName: 'Queries',

  getInitialState: function() {
    return { selectedTab: 'Personal Queries' };
  },

  render: function () {
    return (
      <div className="row queries-row">
        <TabbedArea name="query-tabs" selectedTab={this.state.selectedTab} onTabChange={this.handleTabChange}>

          <TabPane key={1} name="Personal Queries" selectedTab={this.state.selectedTab}>
            ...
          </TabPane>

          <TabPane key={2} name="Saved Queries" selectedTab={this.state.selectedTab}>
            ...
          </TabPane>

        </TabbedArea>
      </div>
    );
  },

  /* Event Handlers --------------------------------------------------------- */
  handleTabChange: function(tab) {
    this.setState({ selectedTab: tab.props.name });
  }
});

module.exports = Queries;