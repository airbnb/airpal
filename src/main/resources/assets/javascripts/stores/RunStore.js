import alt from '../alt';
import FluxCollection from '../utils/FluxCollection';
import RunActions from '../actions/RunActions';
import RunApiUtils from '../utils/RunApiUtils';

class RunStore {
  constructor() {
    this.bindActions(RunActions);

    this.collection = new FluxCollection({
      comparator: (model) => -model.queryStarted
    });

    this.hasFetchedHistory = false;
    this.online = false;
    this.offline = false;
  }

  // Creates an SSE connection to the backend to make a real time stream
  // with the API
  connect() {
    this.disconnect(); // Close any open connection

    // Create a new listener to the API endpoint
    this._eventSource = new EventSource('/api/updates/subscribe');

    // Listen to incoming messages
    this._eventSource.addEventListener('open', this.handleOpen.bind(this));
    this._eventSource.addEventListener('error', this.handleError.bind(this));
    this._eventSource.addEventListener('message', this.handleMessage.bind(this));

    this.online = true;
    this.offline = false;
  }

  // Close the open SSE connect
  disconnect() {
    if (!!this._eventSource && this._eventSource.readyState) {
      this._eventSource.close();
    }

    this.online = false;
    this.offline = true;
  }

  onWentOnline() {
    this.connect();
  }

  onWentOffline() {
    this.disconnect();
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
    this.collection.update(data.uuid, data);
  }

  onFetchHistory() {
    if (this.hasFetchedHistory) return;
    this.hasFetchedHistory = true;

    RunApiUtils.fetchHistory().then((results) => {
      RunActions.addMultipleRuns(results);
    });
  }

  onExecute({ query, tmpTable }) {
    RunApiUtils.execute(query, tmpTable).then((runObject) => {
      RunActions.addRun(runObject);
    });

    // Do not emit event
    return false;
  }

  onKill(uuid) {
    RunApiUtils.kill(uuid);

    return false;
  }

  // Yeah baby. We're ready to rambo! The SSEConnection has made a connection
  // to the API endpoint and now we should start getting updates (if any runs
  // are running of course).
  handleOpen() {
    RunActions.onOpen();
  }

  // The SSEConnection received an error. Notify the user about this error.
  // @param event {Object} the error object from the API
  handleError(event) {
    RunActions.onError(event);
  }

  // The SSEConnection has received a message from the API. We should notify
  // the application on this.
  // @param event {Object} the event object from the API
  handleMessage(event) {
    var data = JSON.parse(event.data);
    RunActions.onMessage(data);
  }

  static getCollection() {
    return this.getState().collection;
  }
}

export default alt.createStore(RunStore, 'RunStore');
