/** @jsx React.DOM */
var React = require('react');

var ErrorMessage = React.createClass({
  displayName: 'ErrorMessage',

  propTypes: {
    visible: React.PropTypes.bool.isRequired,
    message: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return { visible: this.props.visible };
  },

  componentWillReceiveProps: function() {

    // Make sure the state is up to date when receiving
    // new properties from the parent
    this.setState({ visible: this.props.visible });
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
          <span dangerouslySetInnerHTML={{__html: this.props.message}}></span>
        </p>
      </div>
    );
  },

  /* Events ----------------------------------------------------------------- */
  handleCloseAction: function($event) {
    $event.preventDefault();

    // When the state is set to false, the alert should hide
    this.setState({ visible: false });
  }
});

module.exports = ErrorMessage;
