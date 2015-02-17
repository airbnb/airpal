/** @jsx React.DOM */
var React = require('react');

/* Components */
var TabbedArea      = require('react-bootstrap').TabbedArea,
    TabPane         = require('react-bootstrap').TabPane,
    MyOwnRuns       = require('./MyOwnRuns.react'),
    MySavedQueries  = require('./MySavedQueries.react');

var QueryInformation = React.createClass({
  displayName: 'QueryInformation',
  render: function () {
    return (
      <div className="row spaced query-information-tables">
        <div className="col-sm-12">
          <TabbedArea defaultActiveKey={1} animation={false}>
            <TabPane eventKey={1} tab="My runs">
              <MyOwnRuns />
            </TabPane>
            <TabPane eventKey={2} tab="My saved queries">
              <MySavedQueries />
            </TabPane>
            <TabPane eventKey={3} tab="All running queries">
              {/* <AllRunningQueries /> */}
            </TabPane>
          </TabbedArea>
        </div>
      </div>
    );
  }
});

module.exports = QueryInformation;