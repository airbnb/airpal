/** @jsx React.DOM */
var React   = require('react'),
    _       = require('lodash');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* Stores */
var RunStore      = require('../stores/RunStore');

var MyOwnQueries = React.createClass({
  displayName: 'MyOwnQueries',

  componentWillMount: function() {
    RunActions.connect();
  },

  componentDidMount: function() {

    // Add event listeners to the window to detect online/offline changes
    // for the user
    window.addEventListener('online',   function() { RunActions.wentOnline(); });
    window.addEventListener('offline',  function() { RunActions.wentOffline(); });
  },

  render: function () {
    return (<div>MyOwnQueries</div>);
  }
});

module.exports = MyOwnQueries;
