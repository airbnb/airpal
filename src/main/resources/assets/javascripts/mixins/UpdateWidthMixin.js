'use strict';

var _ = require('lodash');

/**
 * Mixin to update the `width` state based on the DOM element's width whenever
 * the window is resized.
 */

module.exports = {
  getInitialState() {
    return {
      width: 960,
    };
  },

  componentDidMount() {
    /**
     * Create a unique resize handler for each component; otherwise the
     * debounce prevents this from working with multiple components.
     */
    this._onResize = _.debounce((e => this.recomputeWidth()), 50);

    $(window).on('resize', this._onResize);

    /**
     * Wait a few ms to make sure this happens in time.
     */
    _.defer((() => this.recomputeWidth()), 10);
  },

  componentWillUnmount() {
    $(window).off('resize', this._onResize);
  },

  recomputeWidth() {
    var width = $(this.getDOMNode()).innerWidth();
    this.setState({width});
  },
};
