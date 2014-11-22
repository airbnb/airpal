/** @jsx React.DOM */
var React = require('react');

/* Components */
var Header = require('./Header.react');

var AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  render: function () {
    return (
      <div className="airpal-app">
        <Header />
      </div>
    );
  }
});

module.exports = AirpalApp;