var _ = require('lodash');

window.Selectize.define('header', function(options) {
  var defaults, settings, header, fragment, _this;

  // Define the plugins defaults
  defaults = {
    className: 'selectize-header row',
    headers: []
  };

  // Mixin the given options with the defaults
  settings = _.extend(defaults, options);

  // Create the html header
  header = document.createElement('nav');
  header.className = settings.className;

  // Create a document fragment to store the elements
  fragment = document.createDocumentFragment();
  _.map(settings.headers, function(header, idx) {
    var element = document.createElement('div');
    element.className = 'row-' + idx;
    element.appendChild( document.createTextNode(header) );

    // Append the new element to the fragment
    fragment.appendChild(element);
  });

  // Append the fragment once to the header
  header.appendChild(fragment);

  // Handle the initial setup
  _this = this;
  this.setup = (function() {
    var original = _this.setup;
    return function() {
      var $dropdown_content = _this.$dropdown_content;
      original.apply(_this, arguments);

      if (!_this.$header && !_.isEmpty(settings.headers)) {
        _this.$header = $(header);
        _this.$header.prependTo(_this.$dropdown);
      }
    };
  })();
});

module.exports = Selectize;