module.exports = function(){
  'use strict';

  function Emitter(){ };

  Emitter.prototype.on = function(eventName, fn){
    if(!eventName) return;
    if(!fn) return;

    if(!this.queue) this.queue = {};
    if(!this.queue[eventName]) this.queue[eventName] = [];

    this.queue[eventName].push(fn);
  };

  Emitter.prototype.off = function(eventName, fn){
    if(!eventName){
      this.queue = {};
      return;
    }

    if(!this.queue) return;
    if(!this.queue[eventName]) return;

    if(fn){
      this.queue[eventName] = this.queue[eventName].filter(function(f){
        return f !== fn;
      });
    }else{
      this.queue[eventName] = [];
    }
  };

  Emitter.prototype.emit = function(eventName){
    var args = Array.prototype.slice.call(arguments, 1);

    if(!eventName) return;
    if(!this.queue) return;
    if(!this.queue[eventName]) return;

    this.queue[eventName].forEach(function(fn){
      fn.apply(this, args);
    }, this);
  };

  Emitter.mixin = function(Class){
    Object.keys(Emitter.prototype).forEach(function(fn){
      Class.prototype[fn] = Emitter.prototype[fn];
    });
  };

  return Emitter;
};

