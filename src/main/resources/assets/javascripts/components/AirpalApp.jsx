import React from 'react';
import RunActions from '../actions/RunActions';
import ConnectionErrors from './ConnectionErrors';
import LeftPane from './LeftPane';
import RightPane from './RightPane';
import TableExplorer from './TableExplorer';
import UserStore from '../stores/UserStore';
import UserApiUtils from '../utils/UserApiUtils';

function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser()
  };
}

let AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  getInitialState() {
    return getStateFromStore();
  },

  componentDidMount() {
    // Add event listeners to the window to detect
    // when the user goes online/offline
    window.addEventListener('online', RunActions.wentOnline );
    window.addEventListener('offline', RunActions.wentOffline );

    UserStore.listen(this.onChange);
    UserApiUtils.getCurrentUser();
  },

  componentWillUnmount() {
    UserStore.unlisten(this.onChange);
  },

  onChange() {
    this.setState(getStateFromStore());
  },

  render() {
    return (
      <div className="airpal-app">
        <div className='flex flex-row'>
          <LeftPane user={this.state.user} />
          <RightPane />
        </div>
      </div>
    );
  }
});

export default AirpalApp;
