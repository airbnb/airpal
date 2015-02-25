import _ from 'lodash';

let QueryApiUtils = {
  fetchSavedQueries() {
    return new Promise((resolve) => {
      $.ajax({
        type: 'GET',
        url: './api/query/saved',
        contentType: 'application/json',

        success(results) {
          if (_.isEmpty(results)) return;
          resolve(results);
        }
      });
    });
  },

  createQuery(data) {
    return new Promise((resolve) => {
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

          resolve(query);
        }
      });
    });
  },

  destroyQuery(uuid) {
    return new Promise((resolve) => {
      $.ajax({
        type: 'DELETE',
        url: `./api/query/saved/${uuid}`,
        success: resolve
      });
    });
  }
};

export default QueryApiUtils;
