import React from 'react';
import TableInfo from './TableInfo';
import TableSearch from './TableSearch';

let TableExplorer = React.createClass({
  displayName: 'TableExplorer',

  render() {
    return (
      <div className='flex flex-column'>
        <TableSearch />
        <TableInfo />
      </div>
    );
  }
});

export default TableExplorer;
