module.exports = function($, Emitter){
  'use strict';

  function Tooltip(element, trigger, options){
    var title;

    if(!element || !trigger) throw new Error();
    if(!options) options = {};

    // Obtain the tooltip elements.
    this.$element = $(element);
    this.$trigger = $(trigger);

    if(this.$element.length !== 1
       || this.$trigger.length !== 1
       || this.$element.data()['o2-tooltip']
       || this.$trigger.data()['o2-tooltip']){
      throw new Error();
    }

    // Append the tooltip element to the body.
    this.$element.appendTo($('body'));

    // Remove the title attribute or it will produce a second tooltip.
    title = this.$trigger.attr('title');
    if(title){
      this.$trigger.attr('aria-label', title);
      this.$trigger.removeAttr('title');
    }

    // Initialize the tooltip element.
    this.$element.attr('aria-hidden', 'true').reflow();

    // Bind the tooltip's trigger's event.
    switch(options.event){
      case 'none':
        break;

      case 'click':
        this.$trigger.on('click.o2-tooltip', this.toggle.bind(this));
        break;

      case 'hover':
      default:
        this.$trigger
          .on('mouseenter.o2-tooltip', this.show.bind(this))
          .on('mouseleave.o2-tooltip', this.hide.bind(this));
        break;
    }

    // Store this instance on the tooltip elements.
    this.$element.data()['o2-tooltip'] = this;
    this.$trigger.data()['o2-tooltip'] = this;
  };

  Emitter.mixin(Tooltip);

  Tooltip.template =
    '<div class="tooltip {{position}}" role="tooltip">' +
    '  <p class="panel-body">{{text}}</p>' +
    '</div>';

  Tooltip.bind = function(scope){
    // Reference constructor as this to enable it to be wrapped for testing.
    var constructor = this,
        instances = [];

    scope = scope || 'body';

    // Bind custom tooltips.
    $(scope).find('[role="tooltip"]').each(function(){
      //TODO: consider using aria-describedby on trigger
      var $this = $(this),
          $trigger = $($this.data('trigger')),
          event = $this.data('event');

      if($this.data()['o2-tooltip']) return;

      try{
        instances.push(new constructor($this, $trigger, { event: event }));
      }catch(e){ }
    });

    // Generate and bind tooltips from titles.
    $(scope).find('[data-behavior="tooltip"][title]').each(function(){
      var $this = $(this), $tooltip,
          position = $this.data('position'), positionClass,
          event = $this.data('event'),
          title = $this.attr('title');

      if($this.data()['o2-tooltip']) return;

      switch(position){
        case 'bottom':
          positionClass = 'tooltip-top-middle';
          break;
        case 'right':
          positionClass = 'tooltip-left-middle';
          break;
        case 'left':
          positionClass = 'tooltip-right-middle';
          break;
        case 'top':
        default:
          positionClass = 'tooltip-bottom-middle';
          break;
      }

      $tooltip = $(Tooltip.template
          .replace('{{position}}', positionClass)
          .replace('{{text}}', title))
          .appendTo($this.parent());

      try{
        instances.push(new constructor($tooltip, $this, { event: event }));
      }catch(e){ }
    });

    return instances;
  };

  Tooltip.prototype.show = function(e){
    if(e) e.preventDefault();
    if(this.$element.attr('aria-hidden') !== 'true') return;
    this.initializePosition();
    this.$element.attr('aria-hidden', 'false').reflow();
    this.emit('show', this);
  };

  Tooltip.prototype.hide = function(e){
    if(e) e.preventDefault();
    if(this.$element.attr('aria-hidden') !== 'false') return;
    this.$element.removeAttr('aria-hidden').afterTransition(function(){
      this.$element.attr('aria-hidden', 'true').reflow();
      this.emit('hide', this);
    }.bind(this));
  };

  Tooltip.prototype.toggle = function(e){
    if(this.$element.attr('aria-hidden') === 'true'){
      this.show(e);
    }else{
      this.hide(e);
    }
  };

  Tooltip.prototype.dispose = function(){
    this.hide();

    delete this.$element.data()['o2-tooltip'];
    this.$element.removeAttr('aria-hidden').detach();

    delete this.$trigger.data()['o2-tooltip'];
    this.$trigger.off('.o2-tooltip');
  };

  Tooltip.caretSize = 12;

  Tooltip.prototype.initializePosition = function(){
    var i, trigger, element, style = {},
        primaryClasses = ['top', 'bottom', 'left', 'right'];

    trigger = {
      height:  this.$trigger.outerHeight(),
      width:   this.$trigger.outerWidth(),
      offset:  this.$trigger.offset()
    };

    element = {
      height:  this.$element.outerHeight(),
      width:   this.$element.outerWidth(),
      classes: this.$element.attr('class').split(' ')
    };

    for(i = 0; i < element.classes.length; i++){
      if(element.classes[i].indexOf('tooltip-') === 0){
        element.classes = element.classes[i].split('-').slice(1);
        if(primaryClasses.indexOf(element.classes[0]) !== -1) break;
      }
    }

    switch(element.classes[0]){
      case 'top':
        style.top = trigger.offset.top + trigger.height + Tooltip.caretSize;
        break;
      case 'bottom':
        style.top = trigger.offset.top - element.height - Tooltip.caretSize;
        break;
      case 'left':
        style.left = trigger.offset.left + trigger.width + Tooltip.caretSize;
        break;
      case 'right':
        style.left = trigger.offset.left - element.width - Tooltip.caretSize;
        break;
      default:
        throw new Error();
    }

    if(style.hasOwnProperty('top')){
      switch(element.classes[1]){
        case 'left':
          style.left = trigger.offset.left;
          break;
        case 'middle':
          style.left = trigger.offset.left + (trigger.width / 2)
                                           - (element.width / 2);
          break;
        case 'right':
          style.left = trigger.offset.left + trigger.width - element.width;
          break;
        default:
          throw new Error();
      }
    }else{
      switch(element.classes[1]){
        case 'top':
          style.top = trigger.offset.top;
          break;
        case 'middle':
          style.top = trigger.offset.top + (trigger.height / 2)
                                         - (element.height / 2);
          break;
        case 'bottom':
          style.top = trigger.offset.top + trigger.height - element.height;
          break;
        default:
          throw new Error();
      }
    }

    this.$element.css(style);
  };

  return Tooltip;
}

