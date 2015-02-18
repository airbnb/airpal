/** @jsx React.DOM */
var React = require('react');

/* Components */
var RunsTable = require('./RunsTable.react');

var AllRunningQueries = React.createClass({
  displayName: 'AllRunningQueries',

  render() {
    return <RunsTable forCurrentUser={false} />;
  },
});

module.exports = AllRunningQueries;
