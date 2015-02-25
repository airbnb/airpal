import React from 'react';
import UserActions from '../actions/UserActions';
import UserStore from '../stores/UserStore';

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

  componentDidMount() {
    UserStore.listen(this._onChange);
    UserActions.fetchCurrentUser();
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
