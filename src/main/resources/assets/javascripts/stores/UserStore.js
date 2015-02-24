import alt from '../alt';
import UserActions from '../actions/UserActions';
import RunApiUtils from '../utils/RunApiUtils';

class UserStore {
  constructor() {
    this.user = UserStore.getDefaultUser();
    this.bindAction(UserActions.receivedCurrentUser, this.onReceivedCurrentUser);
  }

  onReceivedCurrentUser(user) {
    this.user = user;

    // Now fetch queries for that user.
    RunApiUtils.fetchForUser(this.user);
  }

  static getDefaultUser() {
    return {
      name: 'unknown',
      executionPermissions: {
        accessLevel: 'default',
        canCreateCsv: false,
        canCreateTable: false
      }
    };
  }

  static getCurrentUser() {
    return this.getState().user;
  }
}

module.exports = alt.createStore(UserStore, 'UserStore');
