'use strict'

jest.dontMock('../../javascripts/stores/UserStore');

describe('UserStore', () => {
  const UserStore = require('../../javascripts/stores/UserStore');

  it('returns a default user', () => {
    console.info('it returns a default user');

    const currentUser = UserStore.getCurrentUser();
    expect(currentUser['name']).toEqual('unknown');
  });
});
