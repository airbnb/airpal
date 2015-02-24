import alt from '../alt';

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
    this.dispatch({ query, tmpTable });
  }

  kill(uuid) {
    RunApiUtils.kill(uuid);
  }

  onMessage(data) {
    this.dispatch(data.job);
  }
}

export default alt.createActions(RunActions);
