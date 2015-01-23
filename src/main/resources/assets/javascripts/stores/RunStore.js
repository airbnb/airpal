/**
 * RunStore
 */

var StoreDefaults   = require('./StoreDefaults');
var AppDispatcher   = require('../dispatchers/AppDispatcher');
var RunConstants    = require('../constants/RunConstants');
var RunActions      = require('../actions/RunActions');
var RunApiUtils     = require('../utils/RunApiUtils');

/* Store helpers */
var EventEmitter  = require('events').EventEmitter;
var assign        = require('object-assign');
var _             = require('lodash');

var RunStore = assign({}, StoreDefaults, EventEmitter.prototype, {

  createOrUpdate: function(data) {
    console.log(data);
  },

  // Creates an SSE connection to the backend to make a real time stream
  // with the API
  connect: function() {
    this.close(); // Close any open connection

    // Create a new listener to the API endpoint
    this._eventSource = new EventSource('/api/updates/subscribe');

    // Listen to incoming messages
    this._eventSource.addEventListener('open', this.onOpen.bind(this));
    this._eventSource.addEventListener('error', this.onError.bind(this));
    this._eventSource.addEventListener('message', this.onMessage.bind(this));
  },

  // Close the open SSE connect
  close: function() {
    if (!!this._eventSource && this._eventSource.readyState) {
      this._eventSource.close();
    }
  },

  // Yeah baby. We're ready to rambo! The SSEConnection has made a connection
  // to the API endpoint and now we should start getting updates (if any runs
  // are running of course).
  onOpen: function() {
    RunActions.onOpen();
  },

  // The SSEConnection received an error. Notify the user about this error.
  // @param event {Object} the error object from the API
  onError: function(event) {
    RunActions.onError(event);
  },

  // The SSEConnection has received a message from the API. We should notify
  // the application on this.
  // @param event {Object} the event object from the API
  onMessage: function(event) {
    var data = JSON.parse(event.data);
    RunActions.onMessage(data);
  }
});

RunStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case RunConstants.USER_WENT_ONLINE:
      RunStore.connect();
      RunStore.emitChange('online');
      break;

    case RunConstants.USER_WENT_OFFLINE:
      RunStore.close();
      RunStore.emitChange('offline');
      break;

    case RunConstants.ON_MESSAGE:
      RunStore.createOrUpdate(action.data);
      RunStore.emitChange('message');
      break;

    case RunConstants.CONNECT:
      RunStore.connect();
      RunStore.emitChange('connected');
      break;

    case RunConstants.EXECUTE_QUERY:
      RunApiUtils.execute(action.query);
      RunStore.emitChange('execute');
      break;

    default:
      // Do nothing at all
  }

});

module.exports = RunStore;
