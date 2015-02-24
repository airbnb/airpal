import React from 'react';
import QueryEditor from './QueryEditor';
import QueryInformation from './QueryInformation';

let RightPane = React.createClass({
  render() {
    return (
      <div className='flex flex-column'>
        <div className='flex flex-initial'>
          <QueryEditor />
        </div>
        <div className='flex'>
          <QueryInformation />
        </div>
      </div>
    );
  }
});

export default RightPane;
