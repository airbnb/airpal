/**
 * RunApiUtils
 */

/* Actions */
import RunActions from "../actions/RunActions";
import _ from "lodash";

export default {
  execute(query, tmpTable) {
    $.ajax({
      type: 'PUT',
      url: './api/execute',
      contentType: 'application/json',

      data: JSON.stringify({
        query,
        tmpTable
      }),

      success(runObject, status, xhr) {
        RunActions.addRun(runObject);
      }
    });
  },

  fetchForUser(user) {
    $.ajax({
      type: 'GET',
      url: './api/users/' + user.name + '/active-queries',
      contentType: 'application/json',

      success(results, status, xhr) {
        if ( _.isEmpty(results) ) return;

        // Add each run to the collection
        RunActions.addMultipleRuns(results);
      }
    });
  },

  fetchHistory() {
    $.ajax({
      type: 'GET',
      url: './api/query/history',
      contentType: 'application/json',

      success(results) {
        if ( _.isEmpty(results) ) return;

        // Add each run to the collection
        RunActions.addMultipleRuns(results);
      }
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
