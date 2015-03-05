import React from 'react';
import RunActions from '../actions/RunActions';
import RunsTable from './RunsTable';

let AllRunningQueries = React.createClass({
  componentWillMount() {
    RunActions.fetchHistory();
  },

  render() {
    return (
      <RunsTable
        tableWidth={this.props.tableWidth}
        tableHeight={this.props.tableHeight} />
    );
  }
});

export default AllRunningQueries;
