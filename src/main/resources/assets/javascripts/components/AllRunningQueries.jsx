import React from 'react';

import RunActions from '../actions/RunActions';

import RunsTable from './RunsTable.jsx';

let AllRunningQueries = React.createClass({
  componentWillMount() {
    RunActions.fetchHistory();
  },

  render() {
    return <RunsTable />;
  },
});

export default AllRunningQueries;
