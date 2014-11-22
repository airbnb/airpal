/** @jsx React.DOM */
var React = require('react');

/* Components */
var Header      = require('./Header.react'),
    TableSearch = require('./TableSearch.react'),
    TableInfo   = require('./TableInfo.react');

var AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  render: function () {
    return (
      <div className="airpal-app">
        <Header />
        <TableSearch />
        <TableInfo />
      </div>
    );
  }
});

module.exports = AirpalApp;