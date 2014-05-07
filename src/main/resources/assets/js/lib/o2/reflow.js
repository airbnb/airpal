module.exports = function($){
  'use strict';

  if($.fn.reflow) return $;

  // IE8 does not trigger an automatic reflow for elements that match an
  // attribute selector, but this can be manually triggered by adding and
  // removing a meaningless class. Modern clients require a layout query
  // to trigger a reflow, which is useful for ensuring that a CSS3 transition
  // has a valid keyframe from which to transition.

  $.extend($.fn, {
    reflow: function(){
      this.each(function(){
        $(this).addClass('o2-reflow').removeClass('o2-reflow').height();
      });
      return this;
    }
  });

  return $;
};

