import React from 'react';
import RunActions from '../actions/RunActions';
import ConnectionErrors from './ConnectionErrors';
import LeftPane from './LeftPane';
import TableExplorer from './TableExplorer';
import QueryHistory from './QueryHistory';
import QueryEditor from './QueryEditor';
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

  componentWillMount() {
    UserApiUtils.getCurrentUser();
  },

  componentDidMount() {
    // Add event listeners to the window to detect
    // when the user goes online/offline
    window.addEventListener('online', RunActions.wentOnline );
    window.addEventListener('offline', RunActions.wentOffline );
    UserStore.listen(this.onChange);
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
          <div classNam='flex flex-column'>
            <div className='flex flex-initial'>
              <QueryEditor />
            </div>
            <div className='flex'>
              <QueryHistory />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default AirpalApp;
