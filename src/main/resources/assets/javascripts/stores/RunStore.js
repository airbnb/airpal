/**
 * RunStore
 */

var BaseStore   = require('./BaseStore');
var AppDispatcher   = require('../dispatchers/AppDispatcher');
var RunConstants    = require('../constants/RunConstants');
var RunActions      = require('../actions/RunActions');
var RunApiUtils     = require('../utils/RunApiUtils');

class RunStoreClass extends BaseStore {

  constructor() {
    super();

    this._hasFetchedHistory = false;
  }

  // A custom comparator to sort (inverse) on the queryStarted param
  // @param obj {Object} the model
  // @return {Integer} the sorted model
  comparator(model) {
    return -model.queryStarted;
  }

  // Creates an SSE connection to the backend to make a real time stream
  // with the API
  connect() {
    this.close(); // Close any open connection

    // Create a new listener to the API endpoint
    this._eventSource = new EventSource('/api/updates/subscribe');

    // Listen to incoming messages
    this._eventSource.addEventListener('open', this.onOpen.bind(this));
    this._eventSource.addEventListener('error', this.onError.bind(this));
    this._eventSource.addEventListener('message', this.onMessage.bind(this));
  }

  // Close the open SSE connect
  close() {
    if (!!this._eventSource && this._eventSource.readyState) {
      this._eventSource.close();
    }
  }

  // Yeah baby. We're ready to rambo! The SSEConnection has made a connection
  // to the API endpoint and now we should start getting updates (if any runs
  // are running of course).
  onOpen() {
    RunActions.onOpen();
  }

  // The SSEConnection received an error. Notify the user about this error.
  // @param event {Object} the error object from the API
  onError(event) {
    RunActions.onError(event);
  }

  // The SSEConnection has received a message from the API. We should notify
  // the application on this.
  // @param event {Object} the event object from the API
  onMessage(event) {
    var data = JSON.parse(event.data);
    RunActions.onMessage(data);
  }

  ensureFetchedHistory() {
    if (this._hasFetchedHistory) return;
    this._hasFetchedHistory = true;

    RunApiUtils.fetchHistory();
  }

  kill(uuid) {
    RunApiUtils.kill(uuid);
  }
}

var RunStore = new RunStoreClass();

RunStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case RunConstants.USER_WENT_ONLINE:
      RunStore.connect();
      RunStore.emitChange('online');
      break;

    case RunConstants.USER_WENT_OFFLINE:
      RunStore.close();
      break;

    case RunConstants.ADD_MULTIPLE_RUNS:
      RunStore.add(action.data);
      RunStore.emitChange('change');
      break;

    case RunConstants.ADD_RUN:
      RunStore.add(action.data);
      RunStore.emitChange('change');
      break;

    case RunConstants.ON_SSE_MESSAGE:
      RunStore.update(action.data.uuid, action.data);
      RunStore.emitChange('change');
      break;

    case RunConstants.CONNECT:
      RunStore.connect();
      RunStore.emitChange('connected');
      break;

    case RunConstants.DISCONNECT:
      RunStore.close();
      RunStore.emitChange('disconnected');
      break;

    case RunConstants.EXECUTE_RUN:
      RunApiUtils.execute(action.query, action.tmpTable);
      RunStore.emitChange('execute');
      break;

    case RunConstants.KILL_RUN:
      RunStore.kill(action.uuid);
      break;

    default:
      // Do nothing at all
  }

});

module.exports = RunStore;
