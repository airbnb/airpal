/** @jsx React.DOM */
var React = require('react');
var AppDispatcher = require('../AppDispatcher');

/* Stores */
var UserStore = require('../stores/UserStore');

/* Constants */
var UserConstants = require('../constants/UserConstants')

// State actions
function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser()
  };
}

/* Header component */
var Header = React.createClass({
  displayName: 'Header',

  getInitialState: function() {
    return getStateFromStore();
  },

  componentWillMount: function() {

    // Get the user from the API
    $.ajax({
      type: 'GET',
      url: './api/user',

      success: function(user) {

        // Notify the application we've got a new user
        AppDispatcher.handleServerAction({
          type: UserConstants.RECEIVE_USER_INFO,
          rawUserInfo: user
        });
      }
    })

  },

  componentDidMount: function() {
    UserStore.addStoreListener('add', this._onChange);
  },

  componentWillUnmount: function() {
    UserStore.removeStoreListener('add');
  },

  render: function () {
    return (
      <header className="row header-row">

        <div className="col-sm-7">
          <h1>Airpal</h1>
        </div>

        <div className="col-sm-5">

          <div className="row">
            <div className="col-sm-4">
              <dl>
                <dt>User Name</dt>
                <dd>{this.state.user.name}</dd>
              </dl>
            </div>

            <div className="col-sm-4">
              <p>
                <strong>Access Level &nbsp;</strong>
                <a href="https://airbnb.hackpad.com/Airpal-9FiIU3O2BJ1#:h=Access-Levels" target="_blank"
                  data-toggle="tooltip" data-placement="bottom" title="For more info about the access rights, see the HackPad">
                  <span className="glyphicon glyphicon-info-sign"></span>
                </a>
                <br />
                {this.state.user.executionPermissions.accessLevel}
              </p>
            </div>

            <div className="col-sm-4 text-right">
              <a href="#" className="btn btn-default" id="start-tour">Take Tour</a>
            </div>

          </div>

        </div>

      </header>
    );
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = Header;