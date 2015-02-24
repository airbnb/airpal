import React from 'react';
import TableExplorer from './TableExplorer';

let LeftPane = React.createClass({
  render() {
    return (
      <div className='flex flex-column flex-initial left-pane'>
        <div className='info'>
          <h3 className='abel brand'>
            AIRPAL
          </h3>
          <div className='flex flex-row flex-initial'>
            <div className='flex flex-column'>
              <div>
                <small>username</small>
              </div>
              <div className='abel'>
                {this.props.user.name}
              </div>
            </div>
            <div className='flex flex-column'>
              <div>
                <small>access level</small>
              </div>
              <div className='abel'>
                {this.props.user.executionPermissions.accessLevel}
              </div>
            </div>
          </div>
        </div>
        <TableExplorer />
      </div>
    );
  }
});

export default LeftPane;
