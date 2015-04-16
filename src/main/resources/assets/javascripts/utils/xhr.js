const status = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};

const json = (response) => {
  if (response.status !== 204) {
    return response.json();
  } else {
    return {};
  }
};

const xhr = (url, params = {}) => {
  params = Object.assign({
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin'
  }, params);

  return fetch(url, params)
    .then(status)
    .then(json);
};

export default xhr;
