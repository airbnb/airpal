var _ = require('lodash'),
    Selectize = require('./lib/selectize').Selectize;

Selectize.define('header', function(options) {
  options = $.extend({
    className : 'selectize-header',
    headers: []
  }, options);

  var self = this,
      html;

  html = '<div class="selectize-header ' + options.className + '">' +
    _.map(options.headers, function(header, i) {
      return '<div class="' + options.className + '-' + i + '">' +
        header + '</div>';
    }).join('\n') + '</div>';

  self.setup = (function() {
    var original = self.setup;
    return function() {
      var $dropdown_content = self.$dropdown_content;

      original.apply(self, arguments);

      console.log('adding header', options);
      if (!self.$header && !_.isEmpty(options.headers)) {
        self.$header = $(html);
        self.$header.prependTo(self.$dropdown);
      }
    };
  })();
});

module.exports = Selectize;


