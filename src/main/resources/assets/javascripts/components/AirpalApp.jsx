import React from 'react';
import RunActions from '../actions/RunActions';
import ConnectionErrors from './ConnectionErrors';
import Header from './Header';
import TableExplorer from './TableExplorer';
import QueryInformation from './QueryInformation';
import QueryEditor from './QueryEditor';
import TableSearch from './TableSearch';
import ColumnsPreview from './ColumnsPreview';

let AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  componentDidMount() {
    // Add event listeners to the window to detect online/offline changes
    // for the user
    window.addEventListener('online',   function() { RunActions.wentOnline(); });
    window.addEventListener('offline',  function() { RunActions.wentOffline(); });
  },

  render() {
    return (
      <div className='airpal-app flex-column'>
        <div className='flex flex-row flex-initial header'>
          <Header />
        </div>
        <div className='flex flex-row content'>
          <div className='flex flex-column flex-initial left'>
            <div className='flex flex-column'>
              <TableSearch />
              <ColumnsPreview />
            </div>
          </div>
          <div className='flex flex-column right'>
            <QueryEditor />
            <QueryInformation />
          </div>
        </div>
      </div>
    );
  }
});

export default AirpalApp;
