/** @jsx React.DOM */
var React = require('react');

var ErrorMessage = React.createClass({
  displayName: 'ErrorMessage',

  getInitialState: function() {
    return { position: 'main', message: '', visible: false };
  },

  componentWillMount: function() {
    this.setState({
      position: this.props.position || this.state.position
    });
  },

  componentDidMount: function() {

    // Make the error message visible when the newError event is triggered
    Mediator.on('newError', function(message, position) {
      position || (position = 'main')
      if( this.state.position === position ) {
        this.setState({ message: message, visible: true });
      }
    }.bind(this));

    // Hide the error message and clear it when the removeError event is
    // triggered (mostly done internally)
    Mediator.on('removeError', function(position) {
      if( this.state.position === position ) {
        this.setState({ message: '', visible: false });
      }
    }.bind(this));

  },

  componentWillUnmount: function() {

    // Remove the event listeners for the errors
    Mediator.off('newError', 'removeError');
  },

  render: function () {

    // Define the current classes
    var classes = React.addons.classSet({
      'alert': true,
      'alert-danger': true,
      'hide': !this.state.visible
    });

    return (
      <div className={classes} role="alert">
        <button type="button" className="close" onClick={this.handleCloseAction}>
          <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
        </button>

        <p>
          <strong>ERROR: </strong>
          <span dangerouslySetInnerHTML={{__html: this.state.message}}></span>
        </p>
      </div>
    );
  },

  /* Event Handlers */
  handleCloseAction: function() { this.clearMessages(); },

  clearMessages: function(position) {
    position || (position = this.state.position)
    Mediator.emit('removeError', position);
  }
});

module.exports = ErrorMessage;
