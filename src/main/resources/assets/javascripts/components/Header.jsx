import React from 'react';
import UserStore from '../stores/UserStore';
import UserApiUtils from '../utils/UserApiUtils';

// State actions
function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser()
  };
}

let Header = React.createClass({
  displayName: 'Header',

  getInitialState() {
    return getStateFromStore();
  },

  componentWillMount() {
    UserApiUtils.getCurrentUser();
  },

  componentDidMount() {
    UserStore.listen(this._onChange);
  },

  componentWillUnmount() {
    UserStore.unlisten(this._onChange);
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
                <strong>Access Level &nbsp;</strong><br />
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

export default Header;
