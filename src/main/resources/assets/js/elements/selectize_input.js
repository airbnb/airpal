/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    defaultSelectizeOptions,
    SelectizeInput;

defaultSelectizeOptions = {
  plugins: ['remove_button'],
  create: false,
  openOnFocus: true,
  hideSelected: true,
  preload: 'focus',
  loadThrottle: 1000,
};

SelectizeInput = React.createClass({
  getDefaultProps: function() {
    return {
      selectize: {},
      onLoad: function(query, callback) {},
      onItemAdd: function(value, $item) {},
      onItemRemove: function(value, $item) {},
      onOptionRender: function(item, escape) {},
      onOptionActive: function($item) {},
    };
  },
  componentDidMount: function() {
    var $el = $(this.getDOMNode());
    $el.selectize(
      _.extend(
        {},
        defaultSelectizeOptions,
        {
          render: {
            option: this.props.onOptionRender
          },
          load: this.props.onLoad,
          onItemAdd: this.props.onItemAdd,
          onItemRemove: this.props.onItemRemove,
        },
        this.props.selectize)
    );

    this.selectize = $el.data('selectize');
    this.selectize.on('optionActive', function($item) {
      this.props.onOptionActive($item);
    }.bind(this));
  },
  componentWillUnmount: function() {
    this.selectize.destroy();
  },
  render: function() {
    return (<input type="text" ref="input" />);
  },
  forceSearch: function(val) {
    this.selectize.onSearchChange(val);
  },
  updatePlaceholder: function(text) {
    var _selectize = this.selectize;
    _selectize.$control_input.
      attr('placeholder', text).
      data('grow', true).
      trigger('update');
  },
  disable: function() {
    this.selectize.disable();
  },
  enable: function() {
    this.selectize.enable();
  },
  getItems: function() {
    return this.selectize.$control.find('.item');
  },
  setActiveItem: function($item, e) {
    return this.selectize.setActiveItem($item, e);
  },
});

module.exports = SelectizeInput;
