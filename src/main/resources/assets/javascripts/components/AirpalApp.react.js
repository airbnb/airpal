/** @jsx React.DOM */
var React = require('react');

/* Components */
var ConnectionErrors  = require('./ConnectionErrors.react'),
    Header            = require('./Header.react'),
    TableSearch       = require('./TableSearch.react'),
    TableInfo         = require('./TableInfo.react'),
    QueryEditor       = require('./QueryEditor.react'),
    QueryInformation  = require('./QueryInformation.react');

var AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  render: function () {
    return (
      <div className="airpal-app">
        <ConnectionErrors />
        <Header />
        <TableSearch />
        <TableInfo />
        <QueryEditor />
        <QueryInformation />
      </div>
    );
  }
});

module.exports = AirpalApp;