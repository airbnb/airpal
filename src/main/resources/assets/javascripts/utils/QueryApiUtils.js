import _ from 'lodash';
import checkResults from './checkResults';
import xhr from './xhr';

let QueryApiUtils = {
  fetchSavedQueries() {
    return xhr('/api/query/saved').then(checkResults);
  },

  createQuery(data) {
    let formData = Object.keys(data).reduce((encoded, key) => {
      const encKey = encodeURIComponent(key);
      const encData = encodeURIComponent(data[key]);
      return `${encoded}&${encKey}=${encData}`
    }, '');

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
