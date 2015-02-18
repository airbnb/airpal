/** @jsx React.DOM */
var React   = require('react');

/* Components */
var RunsTable = require('./RunsTable.react');

var MyOwnRuns = React.createClass({
  displayName: 'MyOwnRuns',

  render() {
    return <RunsTable forCurrentUser={true} />;
  },
});

module.exports = MyOwnRuns;
