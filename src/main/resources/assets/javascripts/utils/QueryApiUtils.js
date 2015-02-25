import QueryActions from '../actions/QueryActions';
import _ from 'lodash';

let QueryApiUtils = {
  fetchSavedQueries() {
    $.ajax({
      type: 'GET',
      url: './api/query/saved',
      contentType: 'application/json',

      success(results) {
        if (_.isEmpty(results)) return;

        // Add each query to the collection
        QueryActions.receivedQueries(results);
      }
    });
  },

  createQuery(data) {
    $.ajax({
      type: 'POST',
      url: './api/query/saved',
      data,

      success(uuid) {
        let query = {
          uuid,
          name: data.name,
          description: data.description,

          queryWithPlaceholders: {
            query: data.query
          }
        };

        QueryActions.receivedQuery(query);
      }
    });
  },

  destroyQuery(uuid) {
    $.ajax({
      type: 'DELETE',
      url: `./api/query/saved/${uuid}`
    });

    // Optimistically update.
    _.defer(() => QueryActions.receivedDestroyedQuery(uuid));
  }
};

export default QueryApiUtils;
