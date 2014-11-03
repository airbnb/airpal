/** @jsx React.DOM */
var React = require('react'),
    _     = require('lodash');

var SelectizeInput = React.createClass({
  displayName: 'SelectizeInput',
  propTypes: {
    placeholder: React.PropTypes.string.isRequired,
    selectizeOptions: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {

    // Define the input for this component
    this.input = this.refs.selectize.getDOMNode();
    this.$input = $(this.input);

    // Activate the selectize plugin
    this.$input.selectize(
      _.extend(this._defaultSelectizeOptions(), this.props.selectizeOptions())
    );

    // Define the $selectize instance
    this.$selectize = this.$input[0].selectize;

    // Check or the editor is disabled
    if(this.props.disabled) {
      this._disable();
    }
  },

  componentWillUnmount: function() {
    this.$selectize.destroy();
  },

  render: function () {
    return (
      <input ref="selectize" type="text" placeholder={this.props.placeholder} />
    );
  },

  /* Internal Helpers ------------------------------------------------------- */
  _defaultSelectizeOptions: function() {
    return {
      create:       false,
      openOnFocus:  true,
      preload:      'focus',
      loadThrottle: 1000
    };
  },

  // Enables the selectize plugin
  enable: function() { return this._enable(); }, // Alias for internal function
  _enable: function() {
    this.$selectize.enable();
  },

  // Disables the selectize plugin
  disable: function() { return this._disable(); }, // Alias for internal function
  _disable: function() {
    this.$selectize.disable();
  },

  // Hides the selectize plugin
  close: function() { return this._close(); },
  _close: function() {
    this.$selectize.close();
  }
});

module.exports = SelectizeInput;
