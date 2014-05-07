module.exports = function($, Emitter){
  'use strict';

  function Modal(element, options){
    if(!element) throw new Error();
    if(!options) options = Modal.defaultOptions;

    // Obtain the modal elements.
    this.$element = $(element);
    if(this.$element.length !== 1 || this.$element.data()['o2-modal']){
      throw new Error();
    }

    this.$trigger = $(options.trigger);
    if(this.$trigger.length !== 1) this.$trigger = $();
    else if(this.$trigger.data()['o2-modal']) throw new Error();

    this.$container = $(options.container);
    if(this.$container.length !== 1) this.$container = $('body');

    // Append the modal element to its container.
    if(!this.$element.parents().is(this.$container)){
      this.$element.appendTo(this.$container);
    }

    // Ensure the container is initialized.
    if(this.$container.data()['o2-modal-instances'] == null){
      this.$container.data()['o2-modal-instances'] = [];
      this.$container.data()['o2-modal-open'] = 0;
    }

    // Position the modal element within the container.
    if(!this.$container.is('body')){
      this.$element.addClass('modal-absolute');
    }

    // Initialize the modal element and delegate the modal close events.
    this.$element
      .attr('aria-hidden', 'true').reflow()
      .on('click.o2-modal', '[data-behavior="modal-close"]',
          this.close.bind(this));

    // Bind the modal's trigger's event.
    this.$trigger.on('click.o2-modal', this.open.bind(this));

    if(!options.sticky){
      // Close upon clicking the modal backdrop.
      this.$element.on('click.o2-modal', function(e){
        $(e.target).is('.modal-cell') && this.close();
      }.bind(this));

      // Close upon pressing the ESC key.
      this.$container.on('keyup.o2-modal', function(e){
        var ESC = 27;
        e.which == ESC && $(e.target).is(':not(input)') && this.close();
      }.bind(this));
    }

    // Store this instance on the modal element.
    this.$element.data()['o2-modal'] = this;
    if(this.$trigger.length) this.$trigger.data()['o2-modal'] = this;
    this.$container.data()['o2-modal-instances'].push(this);
  }

  Emitter.mixin(Modal);

  Modal.defaultOptions = { sticky: false };

  Modal.bind = function(scope){
    // Reference constructor as this to enable it to be wrapped for testing.
    var constructor = this,
        instances = [];

    $(scope || 'body').find('[role="dialog"]').each(function(){
      //TODO: consider using aria-controls on trigger
      //TODO: consider using aria-owns on container
      var $this = $(this),
          $trigger = $($this.data('trigger')),
          $container = $($this.data('container')),
          sticky = !!$this.data('sticky');

      if($this.data()['o2-modal']) return;

      try{
        instances.push(new constructor($this, {
          trigger: $trigger,
          container: $container,
          sticky: sticky
        }));
      }catch(e){ }
    });

    return instances;
  };

  Modal.prototype.open = function(e){
    if(e) e.preventDefault();
    if(this.$element.attr('aria-hidden') !== 'true') return;

    this.$element.attr('aria-hidden', 'false').afterTransition(function(){
      this.$element.reflow();
      if(this.$container.data()['o2-modal-open']++ === 0){
        this.$container.addClass('modal-open');
      }
      this.emit('open', this);
    }.bind(this));
  };

  Modal.prototype.close = function(e){
    if(e) e.preventDefault();
    if(this.$element.attr('aria-hidden') !== 'false') return;

    this.$element.removeAttr('aria-hidden').afterTransition(function(){
      this.$element.attr('aria-hidden', 'true').reflow();
      if(this.$container.data()['o2-modal-open']-- === 1){
        this.$container.removeClass('modal-open');
      }
      this.emit('close', this);
    }.bind(this));
  };

  Modal.prototype.dispose = function(){
    this.close();

    delete this.$element.data()['o2-modal'];
    this.$element
      .removeClass('modal-absolute')
      .removeAttr('aria-hidden')
      .off('.o2-modal')
      .detach();

    if(this.$trigger.length) delete this.$trigger.data()['o2-modal'];
    this.$trigger.off('.o2-modal');

    this.$container.data()['o2-modal-instances'] =
      this.$container.data()['o2-modal-instances'].filter(function(modal){
        return modal !== this;
      }.bind(this));
    if(this.$container.data()['o2-modal-instances'].length === 0){
      delete this.$container.data()['o2-modal-instances'];
      delete this.$container.data()['o2-modal-open'];
      this.$container.off('.o2-modal');
    }
  };

  return Modal;
};

