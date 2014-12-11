'use strict'

jest.dontMock('../../javascripts/stores/UserStore');

describe('UserStore', function() {

  var UserDispatcher, UserStore, callback;

  beforeEach(function() {
    UserDispatcher = require('../../javascripts/dispatchers/UserDispatcher');
    UserStore = require('../../javascripts/stores/UserStore');
    callback = UserDispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    console.info('it registers a callback with the dispatcher');
    expect(UserDispatcher.register.mock.calls.length).toBe(1);
  });

  it('returns a default user', function() {
    console.info('it returns a default user');

    var currentUser = UserStore.getCurrentUser();
    expect(currentUser['name']).toEqual('unknown');
  });
});