import alt from '../alt';
import RunActions from '../actions/RunActions';
import UserApiUtils from '../utils/UserApiUtils';
import RunApiUtils from '../utils/RunApiUtils';
import logError from '../utils/logError'

class UserActions {
  fetchCurrentUser() {
    UserApiUtils.fetchCurrentUser().then((user) => {
      this.actions.receivedCurrentUser(user);

      // Now fetch queries for that user.
      return RunApiUtils.fetchForUser(user);
    }).then((results) => {
      RunActions.addMultipleRuns(results);
    }).catch(logError);
  }

  receivedCurrentUser(user) {
    this.dispatch(user);
  }
}

module.exports = alt.createActions(UserActions);
