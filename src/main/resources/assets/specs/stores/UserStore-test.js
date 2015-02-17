'use strict'

jest.dontMock('../../javascripts/stores/UserStore');

describe('UserStore', function() {

  var UserDispatcher, UserStore, callback;

  beforeEach(function() {
    UserDispatcher = require('../../javascripts/dispatchers/AppDispatcher');
    UserStore = require('../../javascripts/stores/UserStore');
    callback = UserDispatcher.register.mock.calls[0][0];
  });

  it('returns a default user', function() {
    console.info('it returns a default user');

    var currentUser = UserStore.getCurrentUser();
    expect(currentUser['name']).toEqual('unknown');
  });
});