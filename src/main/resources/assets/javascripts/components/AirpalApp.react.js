/** @jsx React.DOM */

/**
 * Dependencies
 */
var React = require('react');

/**
 * Actions
 */
var RunActions = require('../actions/RunActions');

/**
 * Components
 */
var ConnectionErrors = require('./ConnectionErrors.react');
var Header = require('./Header.react');
var TableSearch = require('./TableSearch.react');
var TableInfo = require('./TableInfo.react');
var QueryEditor = require('./QueryEditor.react');
var QueryInformation = require('./QueryInformation.react');


var AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  componentDidMount: function() {

    // Add event listeners to the window to detect online/offline changes
    // for the user
    window.addEventListener('online', RunActions.wentOnline);
    window.addEventListener('offline', RunActions.wentOffline);
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
