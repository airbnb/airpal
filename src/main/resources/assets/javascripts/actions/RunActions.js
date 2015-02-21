import alt from '../alt';
import RunApiUtils from '../utils/RunApiUtils';

class RunActions {
  constructor() {
    this.generateActions(
      'addMultipleRuns',
      'addRun',
      'connect',
      'disconnect',
      'fetchHistory',
      'onError',
      'onOpen',
      'resetOnlineStatus',
      'wentOffline',
      'wentOnline'
    );
  }

  execute({ query, tmpTable }) {
    // XXX we should add this run to the UI anyway
    RunApiUtils.execute(query, tmpTable);
  }

  kill(uuid) {
    RunApiUtils.kill(uuid);
  }

  onMessage(data) {
    this.dispatch(data.job);
  }
}

export default alt.createActions(RunActions);
