'use strict'

jest.dontMock('../../javascripts/stores/UserStore');

describe('UserStore', () => {
  const UserStore = require('../../javascripts/stores/UserStore');

  it('returns a default user', () => {
    const defaultUser = UserStore.getDefaultUser();
    expect(typeof defaultUser).toEqual('object');
    expect(defaultUser['name']).toEqual('unknown');
  });

  it('has a default user initially set', () => {
    const currentUser = UserStore.getCurrentUser();
    expect(currentUser['name']).toEqual('unknown');
  });
});
