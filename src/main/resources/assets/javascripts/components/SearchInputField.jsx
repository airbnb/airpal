import React from 'react';
import _ from 'lodash';

let SearchInputField = React.createClass({
  displayName: 'SearchInputField',

  propTypes: {
    placeholder: React.PropTypes.string.isRequired,
    selectizeOptions: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      loading: true
    };
  },

  componentDidMount() {

    // Define the input for this component
    this.input = this.refs.selectize.getDOMNode();
    this.$input = $(this.input);

    // Activate the selectize plugin
    this.$input.selectize(
      _.extend(this._defaultSelectizeOptions(), this.props.selectizeOptions())
    );

    // Define the $selectize instance
    this.$selectize = this.$input[0].selectize;

    this.$selectize.on('load', () => {
      this.setState({
        loading: false
      });
    });

    // Check or the editor is disabled
    if(this.props.disabled) {
      this._disable();
    }
  },

  componentWillUnmount() {
    this.$selectize.destroy();
  },

  render() {
    return (
      <div className="selectize-container">
        <div>
          <input ref="selectize" type="text" placeholder={this.props.placeholder} />
        </div>
        {this.state.loading ?
          <span className="glyphicon glyphicon-repeat indicator-spinner selectize-indicator"></span>
        : null}
      </div>
    );
  },

  /* Internal Helpers ------------------------------------------------------ */
  _defaultSelectizeOptions() {
    return {
      create:       false,
      openOnFocus:  true,
      preload:      'focus',
      loadThrottle: 1000,
      closeAfterSelect: true,
      hideSelected: true,

      onChange() {
        this.close();
      }
    };
  },

  componentWillReceiveProps(nextProps) {
    let nextSelectizeOpts = nextProps.selectizeOptions();

    if (this.props.placeholder !== nextProps.placeholder) {
      this.$selectize.
        $control_input.
        attr('placeholder', nextProps.placeholder).
        data('grow', true).
        trigger('update');
    }

    this.$selectize.settings.load = nextSelectizeOpts.load;

    if (nextProps.activeOption) {
      window.$selectize = this.$selectize;
      this.$selectize.load(function(callback) {
        nextSelectizeOpts.load(null, callback);
      });
      _.defer(function() {
        this.$selectize.addItem(nextProps.activeOption, true);
        const $item = this.$selectize.getItem(nextProps.activeOption);
        if (!_.isEmpty($item)) {
          this.$selectize.setActiveItem($item[0], undefined, true);
        }
      }.bind(this));
    }

    if (this.props.disabled !== nextProps.disabled) {
      if (!nextProps.disabled) {
        this.$selectize.enable();
        this.$selectize.loadedSearches = {};
        this.$selectize.refreshOptions(false);
      } else {
        this.$selectize.disable();
        this.$selectize.clear();
        this.$selectize.clearOptions();
      }
    }
  },

  // Enables the selectize plugin
  // Alias for internal function
  enable() { return this._enable(); },

  _enable() {
    this.$selectize.enable();
  },

  // Disables the selectize plugin
  // Alias for internal function
  disable() { return this._disable(); },

  _disable() {
    this.$selectize.disable();
  }
});

export default SearchInputField;
