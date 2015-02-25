export default {
  fetchCurrentUser() {
    return new Promise((resolve) => {
      $.ajax({
        type: 'GET',
        url: './api/user',
        success: resolve
      });
    });
  }
};
