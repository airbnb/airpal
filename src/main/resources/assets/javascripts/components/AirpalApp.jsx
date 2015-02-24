var React = require('react');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* Components */
var ConnectionErrors = require('./ConnectionErrors');
var Header = require('./Header');
var TableExplorer = require('./TableExplorer');
var QueryHistory = require('./QueryHistory');
var QueryEditor = require('./QueryEditor');

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
        <TableExplorer />
        <QueryEditor />
        <QueryHistory />
      </div>
    );
  }
});

module.exports = AirpalApp;
