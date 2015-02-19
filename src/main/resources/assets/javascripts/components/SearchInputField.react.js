/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var _ = require('lodash');

var SearchInputField = React.createClass({
  displayName: 'SearchInputField',

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

  /* Internal Helpers ------------------------------------------------------ */
  _defaultSelectizeOptions: function() {
    return {
      create:       false,
      openOnFocus:  true,
      preload:      'focus',
      loadThrottle: 1000,
      closeAfterSelect: true,
      hideSelected: true,
      onChange: function() {
        this.close();
      },
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var nextSelectizeOpts = nextProps.selectizeOptions();

    if (this.props.placeholder !== nextProps.placeholder) {
      this.$selectize.
        $control_input.
        attr('placeholder', nextProps.placeholder).
        data('grow', true).
        trigger('update');
    }

    this.$selectize.settings.load = nextSelectizeOpts.load;

    if (this.props.disabled !== nextProps.disabled) {
      if (!nextProps.disabled) {
        this.$selectize.enable();
        this.$selectize.loadedSearches = {};
        this.$selectize.refreshOptions(false);
      } else {
        this.$selectize.disable();
      }
    }
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
  }
});

module.exports = SearchInputField;
