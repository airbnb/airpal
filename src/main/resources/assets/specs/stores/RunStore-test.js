'use strict'

jest.dontMock('../../javascripts/stores/RunStore');

describe('RunStore', function() {

  var AppDispatcher, RunStore, callback;

  beforeEach(function() {
    AppDispatcher = require('../../javascripts/dispatchers/AppDispatcher');
    RunStore = require('../../javascripts/stores/RunStore');
    callback = AppDispatcher.register.mock.calls[0][0];
  });

  describe('SSE connection', function() {
    describe('.connect', function() {
      it('creates a new connection', function() {});
      it('closes the current connection', function() {});
    });
  });
});