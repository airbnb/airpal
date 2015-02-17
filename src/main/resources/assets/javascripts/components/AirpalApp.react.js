/** @jsx React.DOM */
var React = require('react');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* Components */
var ConnectionErrors  = require('./ConnectionErrors.react'),
    Header            = require('./Header.react'),
    TableSearch       = require('./TableSearch.react'),
    TableInfo         = require('./TableInfo.react'),
    QueryEditor       = require('./QueryEditor.react'),
    QueryInformation  = require('./QueryInformation.react');

var AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  componentDidMount: function() {

    // Add event listeners to the window to detect online/offline changes
    // for the user
    window.addEventListener('online',   function() { RunActions.wentOnline(); });
    window.addEventListener('offline',  function() { RunActions.wentOffline(); });
  },

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