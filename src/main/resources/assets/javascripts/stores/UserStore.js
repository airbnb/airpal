import alt from '../alt';
import RunActions from '../actions/RunActions';
import UserActions from '../actions/UserActions';
import UserApiUtils from '../utils/UserApiUtils';
import RunApiUtils from '../utils/RunApiUtils';
import logError from '../utils/logError'

class UserStore {
  constructor() {
    this.user = UserStore.getDefaultUser();
    this.bindAction(UserActions.receivedCurrentUser, this.onReceivedCurrentUser);
    this.bindAction(UserActions.fetchCurrentUser, this.onFetchCurrentUser);
  }

  onReceivedCurrentUser(user) {
    this.user = user;

    // Now fetch queries for that user.
    RunApiUtils.fetchForUser(this.user).then((results) => {
      RunActions.addMultipleRuns(results);
    }).catch(logError);
  }

  onFetchCurrentUser() {
    UserApiUtils.fetchCurrentUser().then((user) => {
      UserActions.receivedCurrentUser(user);
    }).catch(logError);
    return false;
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

export default alt.createStore(UserStore, 'UserStore');
