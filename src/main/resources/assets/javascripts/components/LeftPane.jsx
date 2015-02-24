import React from 'react';

let LeftPane = React.createClass({
  render() {
    return (
      <div className='flex flex-column flex-initial left-pane'>
        <h1 className='raleway'>
          AIRPAL
        </h1>
        <div className='flex flex-row'>
          <div className='flex flex-column'>
            <div>
              <small>username</small>
            </div>
            <div className='raleway'>
              {this.props.user.name}
            </div>
          </div>
          <div className='flex flex-column'>
            <div>
              <small>access level</small>
            </div>
            <div className='raleway'>
              {this.props.user.executionPermissions.accessLevel}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default LeftPane;
