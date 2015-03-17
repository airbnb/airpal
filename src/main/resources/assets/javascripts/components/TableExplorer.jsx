import React from 'react';
import TableActions from '../actions/TableActions';
import TableStore from '../stores/TableStore';
import TableApiUtils from '../utils/TableApiUtils';
import { Table, Column } from 'fixed-data-table';

function getState() {
  return {
    table: TableStore.getActiveTable(),
    tables: TableStore.getAll()
  };
}

let TableExplorer = React.createClass({
  displayName: 'TableExplorer',

  getInitialState() {
    return getState();
  },

  componentDidMount() {
    TableStore.listen(this.update);
    TableActions.fetchTables();
  },

  componentWillUnmount() {
    TableStore.unlisten(this.update);
  },

  update() {
    this.setState(getState());
  },

  load(query, callback) {
    $.ajax({
      url: './api/table',
      type: 'GET',
      error() { callback(); },
      success(res) {
        callback(res);
      }
    });
  },

  render() {
    return (
      <div className='flex'>
      </div>
    );
  }
});

export default TableExplorer;
