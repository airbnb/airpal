var React = require('react');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* Components */
var ConnectionErrors = require('./ConnectionErrors.jsx');
var Header = require('./Header.jsx');
var TableExplorer = require('./TableExplorer.jsx');
var QueryHistory = require('./QueryHistory.jsx');
var QueryEditor = require('./QueryEditor.jsx');

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
