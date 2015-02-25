import xhr from './xhr';

export default {
  fetchCurrentUser() {
    return xhr('/api/user');
  }
};
