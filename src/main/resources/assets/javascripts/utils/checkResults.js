import _ from 'lodash';

const checkResults = (results) => {
  if (_.isEmpty(results)) {
    return Promise.reject();
  } else {
    return Promise.resolve(results);
  }
}
export default checkResults;
