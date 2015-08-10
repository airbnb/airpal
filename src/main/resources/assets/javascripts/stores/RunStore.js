import alt from '../alt';
import FluxCollection from '../utils/FluxCollection';
import RunActions from '../actions/RunActions';
import TabActions from '../actions/TabActions';
import ResultsPreviewActions from '../actions/ResultsPreviewActions';
import RunStateConstants from '../constants/RunStateConstants';
import UserStore from '../stores/UserStore';

// Yeah baby. We're ready to rambo! The SSEConnection has made a connection
// to the API endpoint and now we should start getting updates (if any runs
// are running of course).
const handleOpen = function () {
  RunActions.handleConnectionOpen();
};

// The SSEConnection received an error. Notify the user about this error.
// @param event {Object} the error object from the API
const handleError = function (event) {
  RunActions.handleConnectionError(event);
};

// The SSEConnection has received a message from the API. We should notify
// the application on this.
// @param event {Object} the event object from the API
const handleMessage = function (event) {
  var data = JSON.parse(event.data);
  RunActions.handleConnectionMessage(data);
};

class RunStore {
  constructor() {
    this.bindListeners({
      onConnect: [RunActions.WENT_ONLINE, RunActions.CONNECT],
      onDisconnect: [RunActions.WENT_OFFLINE, RunActions.DISCONNECT],
      onResetOnlineStatus: RunActions.RESET_ONLINE_STATUS,
      onAddMultipleRuns: RunActions.ADD_MULTIPLE_RUNS,
      onAddRun: RunActions.ADD_RUN,
      onMessage: RunActions.HANDLE_CONNECTION_MESSAGE,
      onFetchHistory: RunActions.FETCH_HISTORY,
      onExecute: RunActions.EXECUTE
    });

    this.exportPublicMethods({
      getCollection: this.getCollection
    });

    this.collection = new FluxCollection({
      comparator: (model) => -model.queryStarted
    });

    this.hasFetchedHistory = false;
    this.online = false;
    this.offline = false;
  }

  // Creates an SSE connection to the backend to make a real time stream
  // with the API
  onConnect() {
    this.onDisconnect(); // Close any open connection

    // Create a new listener to the API endpoint
    this._eventSource = new EventSource('/api/updates/subscribe');

    // Listen to incoming messages
    this._eventSource.addEventListener('open', handleOpen);
    this._eventSource.addEventListener('error', handleError);
    this._eventSource.addEventListener('message', handleMessage);

    this.online = true;
    this.offline = false;
  }

  // Close the open SSE connect
  onDisconnect() {
    if (!!this._eventSource && this._eventSource.readyState) {
      this._eventSource.close();
    }

    if (this._eventSource) {
      this._eventSource.removeEventListener('open', handleOpen);
      this._eventSource.removeEventListener('error', handleError);
      this._eventSource.removeEventListener('message', handleMessage);
    }

    this.online = false;
    this.offline = true;
  }

  onResetOnlineStatus() {
    this.online = false;
    this.offline = false;
  }

  onAddMultipleRuns(data) {
    this.collection.add(data);
  }

  onAddRun(data) {
    this.collection.add(data);
  }

  onMessage(data) {
    if (data.state === RunStateConstants.FINISHED && data.output.location && 
        data.user === UserStore.getCurrentUser().name) {
      ResultsPreviewActions.loadResultsPreview(data.output.location);
    }
    this.collection.update(data.uuid, data);
  }

  onFetchHistory() {
    if (this.hasFetchedHistory) return;
    this.hasFetchedHistory = true;
  }

  onExecute() {
    TabActions.selectTab.defer(1);
  }

  getCollection() {
    return this.getState().collection;
  }
}

export default alt.createStore(RunStore, 'RunStore');
