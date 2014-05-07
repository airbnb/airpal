module.exports = function($, Emitter){
  'use strict';

  function Tabs(element){
    if(!element) throw new Error();

    this.$element = $(element);
    if(this.$element.length !== 1 || this.$element.data()['o2-tabs']){
      throw new Error();
    }

    this.$element
      .on('click.o2-tabs', '[role="tab"]', this.activateTarget.bind(this))
      .data()['o2-tabs'] = this;
  }

  Emitter.mixin(Tabs);

  Tabs.bind = function(scope){
    // Reference constructor as this to enable it to be wrapped for testing.
    var constructor = this,
        instances = [];

    $(scope || 'body').find('[role="tablist"]').each(function(){
      if($(this).data()['o2-tabs']) return;

      try{
        instances.push(new constructor($(this)));
      }catch(e){ }
    });

    return instances;
  };

  Tabs.prototype.activateTarget = function(e){
    var $target = $(e.currentTarget);
    e.preventDefault();

    if(!$target.attr('aria-disabled')){
      this.activate($(e.currentTarget).attr('aria-controls'));
    }
  };

  Tabs.prototype.activate = function(panelId){
    var activePanelId, $panel, $activePanel, $tab, $activeTab;

    if(!panelId) return;

    // Obtain the panel and tab to activate.
    $panel = $('#' + panelId);
    $tab = this.$element.find('[aria-controls="' + panelId + '"]');
    if($panel.length !== 1 || $tab.length !== 1) return;

    // Obtain the currently active panel and tab.
    $activeTab = this.$element.find('[aria-selected="true"]');
    activePanelId = $activeTab.attr('aria-controls');
    $activePanel = $(activePanelId ? '#' + activePanelId : '');

    // Return early if the panel is already active.
    if(activePanelId === panelId) return;

    // Update the panel and tab states.
    $activePanel.attr('aria-hidden', 'true').reflow();
    $panel.attr('aria-hidden', 'false').reflow();

    $activeTab.attr('aria-selected', 'false').reflow();
    $tab.attr('aria-selected', 'true').reflow();

    // Emit an event.
    this.emit('activate', this, panelId);
  };

  Tabs.prototype.dispose = function(){
    delete this.$element.data()['o2-tabs'];
    this.$element.off('.o2-tabs');
  };

  return Tabs;
}

