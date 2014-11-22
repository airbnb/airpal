/** @jsx React.DOM */
var React                     = require('react'),

    // Elements
    Editor                    = require('../elements/editor'),
    Header                    = require('../elements/header'),
    Selectors                 = require('../elements/selectors'),
    Queries                   = require('../elements/queries'),
    ErrorMessage              = require('../elements/error_message'),

    // Third party libs
    _                         = require('lodash'),
    EventEmitter              = require('events').EventEmitter,
    keymaster                 = require('keymaster');

// Define the application wide event emitter
window.Mediator = new EventEmitter();

// Create the IndexPage element for the application
var IndexPage = React.createClass({
  displayName: 'IndexPage',

  componentDidMount: function() {

    // Get the user
    this._getUserData();

    // Set the keymaster event listeners
    keymaster('backspace', this.handleBackspace);
    keymaster('⌘+r, ctrl+r', this.handleRun);
  },

  componentWillUnmount: function() {

    // Unbind the keymaster event listeners
    keymaster.unbind('backspace', this.handleBackspace);
    keymaster.unbind('⌘-r, ctrl-r', this.handleRun);
  },

  render: function() {
    return (
      <div className="container">
        <Header ref="header" />

        <ErrorMessage ref="error-messages" position="main" />

        <Selectors ref="selectors" />

        <Editor ref="editor" />

        <Queries ref="queries" />
      </div>
    );
  },

  /* Internal helpers ------------------------------------------------------- */
  _getUserData: function() {

    // TODO: Grab the user ID from the DOM(?)
    var id = 1;

    // Get the information about the user
    $.ajax({
      type: 'GET',
      url: './api/users/' + id,

      success: function(user) {
        Mediator.emit('newUser', user);
      },

      error: function(xhr, status, message) {
        Mediator.emit('newError', 'Could not get the user because of <strong>' + message + '<strong>');
      }
    });
  }
});

module.exports = IndexPage;
