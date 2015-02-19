/** @jsx React.DOM */
var React = require('react');

/* Stores */
var UserStore = require('../stores/UserStore');

/* Utils */
var UserApiUtils = require('../utils/UserApiUtils');

// State actions
function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser()
  };
}

/* Header component */
var Header = React.createClass({
  displayName: 'Header',

  getInitialState() {
    return getStateFromStore();
  },

  componentWillMount() {
    UserApiUtils.getCurrentUser();
  },

  componentDidMount() {
    UserStore.addStoreListener('add', this._onChange);
  },

  componentWillUnmount() {
    UserStore.removeStoreListener('add');
  },

  render() {
    return (
      <header className="row header-row">

        <div className="col-sm-9">
          <h1>Airpal</h1>
        </div>

        <div className="col-sm-3">

          <div className="row user-info">
            <div className="col-sm-6">
              <dl>
                <dt>Username</dt>
                <dd className="user-name">{this.state.user.name}</dd>
              </dl>
            </div>

            <div className="col-sm-6">
              <p>
                <strong>Access Level &nbsp;</strong>

                <a href="https://airbnb.hackpad.com/Airpal-9FiIU3O2BJ1#:h=Access-Levels" target="_blank"
                  data-toggle="tooltip" data-placement="bottom" title="For more info about the access rights, see the HackPad">
                  <span className="glyphicon glyphicon-info-sign"></span>
                </a>

                <br />

                <span className="user-permissions">
                  {this.state.user.executionPermissions.accessLevel}
                </span>
              </p>
            </div>

          </div>

        </div>

      </header>
    );
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  }
});

module.exports = Header;
