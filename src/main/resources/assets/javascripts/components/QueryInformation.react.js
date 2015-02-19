/** @jsx React.DOM */
var React = require('react');

/* Components */
var { TabbedArea, TabPane } = require('react-bootstrap');
var MyOwnRuns          = require('./MyOwnRuns.react');
var MySavedQueries     = require('./MySavedQueries.react');
var AllRunningQueries  = require('./AllRunningQueries.react');

var QueryInformation = React.createClass({
  displayName: 'QueryInformation',

  getInitialState() {
    return {
      selectedTab: 1,
    };
  },

  render() {
    var {selectedTab} = this.state;
    return (
      <div className="row spaced query-information-tables">
        <div className="col-sm-12">
          <TabbedArea activeKey={selectedTab} animation={false} onSelect={this._onTabSelect}>
            {/* Lazy-init the child components so they can lazy-fetch their data. */}
            <TabPane eventKey={1} tab="My recent queries">
              {selectedTab === 1 ? <MyOwnRuns /> : null}
            </TabPane>
            <TabPane eventKey={2} tab="My saved queries">
              {selectedTab === 2 ? <MySavedQueries /> : null}
            </TabPane>
            <TabPane eventKey={3} tab="All queries">
              {selectedTab === 3 ? <AllRunningQueries /> : null}
            </TabPane>
          </TabbedArea>
        </div>
      </div>
    );
  },

  _onTabSelect(selectedTab) {
    this.setState({selectedTab});
  },
});

module.exports = QueryInformation;
