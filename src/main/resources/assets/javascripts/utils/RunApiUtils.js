import RunActions from "../actions/RunActions";
import _ from "lodash";

export default {
  execute(query, tmpTable) {
    return new Promise((resolve) => {
      $.ajax({
        type: 'PUT',
        url: './api/execute',
        contentType: 'application/json',

        data: JSON.stringify({
          query,
          tmpTable
        }),

        success(runObject, status, xhr) {
          resolve(runObject);
        }
      });
    });
  },

  fetchForUser(user) {
    return new Promise((resolve) => {
      $.ajax({
        type: 'GET',
        url: `./api/users/${user.name}/active-queries`,
        contentType: 'application/json',

        success(results, status, xhr) {
          if (_.isEmpty(results)) return;
          resolve(results);
        }
      });
    });
  },

  fetchHistory() {
    return new Promise((resolve) => {
      $.ajax({
        type: 'GET',
        url: './api/query/history',
        contentType: 'application/json',

        success(results) {
          if (_.isEmpty(results)) return;
          resolve(results);
        }
      });
    });
  },

  kill(uuid) {
    $.ajax({
      type: 'DELETE',
      url: './api/queries/' + uuid,
      contentType: 'application/json',

      success() {
        // Just let the SSE handle updates.
      }
    });
  }
};
