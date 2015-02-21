var alt = require('../alt');

class UserActions {
  receivedCurrentUser(user) {
    this.dispatch(user);
  }
}

module.exports = alt.createActions(UserActions);
