import _ from 'lodash';
import checkResults from './checkResults';
import xhr from './xhr';

export default {
  execute(query, tmpTable) {
    return xhr('/api/execute', {
      method: 'put',
      body: JSON.stringify({
        query,
        tmpTable
      })
    });
  },

  fetchForUser(user) {
    return xhr(`/api/users/${user.name}/queries`).then(checkResults);
  },

  fetchHistory() {
    return xhr('./api/query/history').then(checkResults);
  },

  kill(uuid) {
    return xhr(`/api/queries/${uuid}`, {
      method: 'delete'
    });
  }
};
