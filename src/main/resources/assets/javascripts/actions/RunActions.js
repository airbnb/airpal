import alt from '../alt';

class RunActions {
  constructor() {
    this.generateActions(
      'addMultipleRuns',
      'addRun',
      'connect',
      'disconnect',
      'fetchHistory',
      'kill',
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

  onMessage(data) {
    this.dispatch(data.job);
  }
}

export default alt.createActions(RunActions);
