var _ = require('lodash'),
    inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;

function SSEConnection() {
  this.isOffline = false;
}

inherits(SSEConnection, EventEmitter);

_.extend(SSEConnection.prototype, {
  connect: function() {
    this.close();
    console.log('opening new SSEConnection');
    this._eventSource = new EventSource('/api/updates/subscribe');
    this._eventSource.addEventListener('open', this.onOpen.bind(this));
    this._eventSource.addEventListener('error', this.onError.bind(this));
    this._eventSource.addEventListener('message', this.onMessage.bind(this));
    window.addEventListener('online', this.updateOnlineOffline.bind(this));
    window.addEventListener('offline', this.updateOnlineOffline.bind(this));
  },
  close: function() {
    console.log('attempting to close SSEConnection', this._eventSource);
    if (!!this._eventSource && this._eventSource.readyState) {
      this._eventSource.close();
    }
  },
  updateOnlineOffline: function() {
    var wasOffline = this.isOffline;
    this.isOffline = !window.navigator.onLine;

    if (wasOffline && !this.isOffline) {
      // Now online, reconnect.
      this.connect();

      this.emit('stateTransition', 'offlineToOnline');
    } else {
      // Offline, explicitly close.
      this.close();

      this.emit('stateTransition', 'onlineToOffline');
    }
  },
  onOpen: function() {
    this.emit('stateTransition', 'connectionOpen');
  },
  onError: function() {
  },
  onMessage: function(e) {
    this.emit('message', e.data);
  },
});

module.exports = SSEConnection;
