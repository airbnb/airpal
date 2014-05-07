module.exports = (function(global, $){
  'use strict';

  var Emitter = require('./emitter')(),
      Modal = require('./modules/modal')($, Emitter),
      Tabs = require('./modules/tabs')($, Emitter),
      Tooltip = require('./modules/tooltip')($, Emitter);

  function bind(scope){
    var instances = [];
    instances = instances.concat(Modal.bind(scope));
    instances = instances.concat(Tabs.bind(scope));
    instances = instances.concat(Tooltip.bind(scope));
    return instances;
  }

  function suppressBind(){
    $(window).off('load.o2');
  }

  // Include cross-browser jQuery support.
  require('./transitions')(global, $);
  require('./reflow')($);

  // Bind events after page load so we don't block the thread.
  // Use null as first argument to prevent using jQuery event as scope.
  $(window).on('load.o2', bind.bind(this, null));

  return {
    bind: bind,
    suppressBind: suppressBind,
    Modal: Modal,
    Tabs: Tabs,
    Tooltip: Tooltip
  };
}(window, $));

