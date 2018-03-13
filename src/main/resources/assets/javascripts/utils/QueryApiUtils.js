// Lodash functions
import map from 'lodash/map';
import join from 'lodash/join';
import objectKeys from 'lodash/keys';

import checkResults from './checkResults';
import xhr from './xhr';

let QueryApiUtils = {
  fetchSavedQueries() {
    return xhr('/api/query/saved').then(checkResults);
  },

  createQuery(data) {
    let formData = join(map(objectKeys(data), key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`), "&");
    
    return xhr('/api/query/saved', {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    }).then((uuid) => {
      return {
        uuid,
        name: data.name,
        description: data.description,

        queryWithPlaceholders: {
          query: data.query
        }
      };
    });
  },

  destroyQuery(uuid) {
    return xhr(`/api/query/saved/${uuid}`, {
      method: 'delete'
    });
  }
};

export default QueryApiUtils;
