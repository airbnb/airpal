/** @jsx React.DOM */
var React   = require('react');
var _       = require('lodash');
var moment  = require('moment');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* ApiUtils */
var RunApiUtils = require('../utils/RunApiUtils');

/* Stores */
var RunStore  = require('../stores/RunStore');
var UserStore = require('../stores/UserStore');

/* FixedDataTable */
var { Table, Column } = require('fixed-data-table');

// State actions
function getRuns(forCurrentUser) {
  if (forCurrentUser) {
    return RunStore.where({user: UserStore.getCurrentUser().name}, {sort: true})
  } else {
    return RunStore.all({sort: true});
  }
}

var RunsTable = React.createClass({
  displayName: 'RunsTable',

  getStateFromStore() {
    return {
      runs: getRuns(this.props.forCurrentUser),
    };
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  componentWillMount() {
    RunActions.connect();
  },

  componentDidMount() {
    RunStore.addStoreListener('change', this._onChange);

    // Make an API call to fetch the previous runs
    UserStore.addStoreListener('change', this._fetchRuns);
  },

  componentWillUnmount() {
    RunActions.disconnect(); // Close the SSE connection

    // Remove the store listeners
    RunStore.removeStoreListener('change', this._onChange);
    UserStore.removeStoreListener('change', this._fetchRuns);
  },

  render() {
    if (this.state.runs.length === 0) {
      return this.renderEmptyMessage();
    }

    return (
      <Table
        rowHeight={40}
        rowGetter={this.rowGetter}
        rowsCount={this.state.runs.length}
        width={960}
        maxHeight={250}
        ownerHeight={250}
        headerHeight={40}>
        {getColumns(this.props.forCurrentUser)}
      </Table>
    );
  },

  rowGetter(rowIndex) {
    return formatRun(this.state.runs[rowIndex]);
  },

  renderEmptyMessage() {
    return (
      <p className="info text-center">No queries to show</p>
    );
  },

  /* Store events */
  _onChange() {
    this.setState(this.getStateFromStore());
  },

  _fetchRuns() {
    RunApiUtils.fetch(UserStore.getCurrentUser());
  },
});

function getColumns(forCurrentUser) {
  return _.compact([
    (forCurrentUser ? null : <Column
      label="User"
      width={80}
      dataKey="user"
      cellRenderer={getRenderer('user')}
    />),
    <Column
      label="Query"
      width={forCurrentUser ? 400 : 320}
      dataKey="query"
      cellRenderer={getRenderer('query')}
    />,
    <Column
      label="Status"
      width={80}
      dataKey="status"
      cellRenderer={getRenderer('status')}
    />,
    <Column
      label="Started"
      width={220}
      dataKey="started"
      cellRenderer={getRenderer('started')}
    />,
    <Column
      label="Duration"
      width={80}
      dataKey="duration"
    />,
    <Column
      label="Output"
      width={180}
      dataKey="output"
      cellRenderer={getRenderer('output')}
    />,
  ]);
}

function formatRun(run) {
  if (!run) return;
  return {
    user: run.user,
    query: run.query,
    status: run.state,
    started: run.queryStarted,
    duration: run.queryStats && run.queryStats.elapsedTime,
    output: run.output && run.output,
    _run: run,
  };
}


/**
 * Wrap each in a `<div >` so FixedDataTable can add classes to it for padding,
 * etc.
 */
function getRenderer(key) {
  return function wrappedRenderer(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
    var content = CellRenderers[key](cellData, cellDataKey, rowData, rowIndex, columnData, width);
    return <div className="text-overflow-ellipsis" style={{width: width}}>{content}</div>;
  };
}

var CellRenderers = {
  user(cellData) {
    return <span title={cellData}>{cellData}</span>;
  },

  query(cellData) {
    return <code>{cellData}</code>;
  },

  status(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
    var run = rowData._run;
    if (run.state === 'FAILED') {
      return (<span className="label label-danger">FAILED</span>);
    } else if (run.state === 'FINISHED') {
      return (<span className="label label-success">{run.state}</span>);
    } else {
      return (<span className="label label-info">{run.state}</span>);
    }
  },

  output(cellData, cellDataKey, rowData) {
    var run = rowData._run;
    var output = cellData;
    if (output && output.location) {
      return (
        <a href={output.location} target="_blank">
          Download CSV
        </a>
      );
    } else if (run.state === 'FAILED') {
      return <span title={run.error.message}>{run.error.message}</span>;
    }
  },

  started(cellData) {
    var m = moment.utc(cellData, 'x');
    var utc = m.format();
    var human = m.format('lll');
    return <span title={utc}>{human} UTC</span>;
  },
}

module.exports = RunsTable;

