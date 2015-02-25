import alt from '../alt';

class UserActions {
  constructor() {
    this.generateActions('fetchCurrentUser');
  }

  receivedCurrentUser(user) {
    this.dispatch(user);
  }
}

module.exports = alt.createActions(UserActions);
