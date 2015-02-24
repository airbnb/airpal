import React from 'react';
import QueryHistory from './QueryHistory';
import QueryEditor from './QueryEditor';

let RightPane = React.createClass({
  render() {
    return (
      <div className='flex flex-column'>
        <div className='flex flex-initial'>
          <QueryEditor />
        </div>
        <div className='flex'>
          <QueryHistory />
        </div>
      </div>
    );
  }
});

export default RightPane;
