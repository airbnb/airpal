/**
 * UserApiUtils
 */

import UserActions from "../actions/UserActions";

export default {
  getCurrentUser() {
    $.ajax({
      type: 'GET',
      url: './api/user',

      success(user) {
        UserActions.receivedCurrentUser(user);
      }
    });
  }
};