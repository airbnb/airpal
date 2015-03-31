import alt from '../alt';
import UserActions from '../actions/UserActions';

class UserStore {
  constructor() {
    this.bindListeners({
      onReceivedCurrentUser: UserActions.RECEIVED_CURRENT_USER
    });

    this.exportPublicMethods({
      getDefaultUser: this.getDefaultUser,
      getCurrentUser: this.getCurrentUser
    });

    this.user = this.getDefaultUser();
  }

  onReceivedCurrentUser(user) {
    this.user = user;
  }

  getDefaultUser() {
    return {
      name: 'unknown',
      executionPermissions: {
        accessLevel: 'default',
        canCreateCsv: false,
        canCreateTable: false
      }
    };
  }

  getCurrentUser() {
    return this.getState().user;
  }
}

export default alt.createStore(UserStore, 'UserStore');
