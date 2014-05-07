module.exports = function(global, $){
  'use strict';

  if($.Transitions) return $;

  $.Transitions = {

    // Time to wait before manually firing the callback under the assumption
    // that the transitionend event will never fire.
    timeout: 600,

    // Mapping of browser-specific style keys to transitionend events.
    events: {
      'transition':       'transitionend',
      'OTransition':      'oTransitionEnd',
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition':    'transitionend'
    },

    eventName: function(){
      var style, eventName = false;
      for(style in this.events){
        if(typeof document.body.style[style] !== 'undefined'){
          eventName = this.events[style];
          break;
        }
      }
      // Cache the value.
      this.eventName = function(){
        return eventName;
      }
      return eventName;
    },

    supported: function(){
      return this.eventName() !== false;
    }

  };

  $.extend($.fn, {
    afterTransition: function(callback, timeout){
      var eventName, event;

      timeout = Number(timeout);
      if(!timeout || timeout < 0) timeout = $.Transitions.timeout;
      if(typeof callback !== 'function') callback = function(){ };

      eventName = $.Transitions.eventName();
      this.each(function(){
        event = $.Event('transitionend');
        event.target = event.currentTarget = this;

        if(!eventName){
          // Fire the callback immediately with a mock jQuery Event if
          // transitions are not supported.
          callback.call(this, event);
        }else{
          var timeoutId, called = false;
          var callbackOnce = function(e){
            if (!called){
              called = true;
              callback.call(this, e || event);
              $(this).off(eventName, callbackOnce);
              global.clearTimeout(timeoutId);
            }
          }.bind(this);

          // Otherwise bind to the browser-specific transitionend event.
          $(this).on(eventName, callbackOnce);

          // Also set a timer to fire the callback after a timeout if the
          // browser fails to fire the transitionend event.
          timeoutId = global.setTimeout(callbackOnce, timeout);
        }
      });
      return this;
    }
  });

  return $;
};

