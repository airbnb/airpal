/** @jsx React.DOM */
'use strict'

jest.dontMock('../../javascripts/components/Header.react');
describe('Header.react', function() {

  var React, UserDispatcher, UserStore, Component, TestUtils, Header, user,
      UserActions;

  // Define the user information
  user = {
    name: 'stefan',
    executionPermissions: {
      accessLevel: 'administrator', canCreateCsv: false, canCreateTable: false
    }
  };

  beforeEach(function() {

    // Require the store and dispatcher
    UserDispatcher = require('../../javascripts/dispatchers/UserDispatcher');
    UserStore = require('../../javascripts/stores/UserStore');
    UserActions = require('../../javascripts/actions/UserActions');

    // Require utilities
    React = require('react/addons');
    Component = require('../../javascripts/components/Header.react');
    TestUtils = React.addons.TestUtils;

    // Render the Header before each test
    Header = TestUtils.renderIntoDocument(<Component />);
  });

  describe('user information', function() {
    describe('default information', function() {
      it('renders the default username', function() {
        console.info('renders the default username');

        // Verify that the default username is rendered
        var username = TestUtils.findRenderedDOMComponentWithClass(Header, 'user-name');
        expect(username.getDOMNode().textContent).toEqual('unknown');
      });

      it('renders the default user permissions', function() {
        console.info('renders the default permissions');

        // Verify that the default permissions is rendered
        var permissions = TestUtils.findRenderedDOMComponentWithClass(Header, 'user-permissions');
        expect(permissions.getDOMNode().textContent).toEqual('default');
      });
    });

    describe('dynamic information', function() {

      it('renders the new username', function() {
        console.info('renders the new username');
      });

    });
  });

});