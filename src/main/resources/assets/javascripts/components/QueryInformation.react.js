/** @jsx React.DOM */
var React = require('react');

/* Components */
var TabbedArea      = require('react-bootstrap').TabbedArea,
    TabPane         = require('react-bootstrap').TabPane,
    MyOwnQueries    = require('./MyOwnQueries.react');

var QueryInformation = React.createClass({
  displayName: 'QueryInformation',
  render: function () {
    return (
      <div className="row spaced query-information-tables">
        <div className="col-sm-12">
          <TabbedArea>
            <TabPane eventKey={1} tab="My queries">
              <MyOwnQueries />
            </TabPane>
            <TabPane eventKey={2} tab="Saved queries">
              {/* <MySavedQueries /> */}
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