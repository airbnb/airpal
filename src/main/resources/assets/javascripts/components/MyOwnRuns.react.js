/** @jsx React.DOM */
var React   = require('react');
var _       = require('lodash');
var moment  = require('moment');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* ApiUtils */
var RunApiUtils = require('../utils/RunApiUtils');

/* Components */
var MyOwnRunsRow = require('./MyOwnRunsRow.react');

/* Stores */
var RunStore  = require('../stores/RunStore');
var UserStore = require('../stores/UserStore');

/* FixedDataTable */
var { Table, Column } = require('fixed-data-table');

// State actions
function getStateFromStore() {
  return {
    runs: RunStore.where({ user: UserStore.getCurrentUser().name }, { sort: true })
  };
}

var MyOwnRuns = React.createClass({
  displayName: 'MyOwnQueries',

  getInitialState() {
    return getStateFromStore();
  },

  componentWillMount() {
    RunActions.connect();
  },

  componentDidMount() {
    RunStore.addStoreListener('change', this._onChange);

    // Make an API call to fetch the previous runs
    UserStore.addStoreListener('change', function() {
      RunApiUtils.fetch(UserStore.getCurrentUser());
    });
  },

  componentWillUnmount() {
    RunActions.disconnect(); // Close the SSE connection

    // Remove the store listeners
    RunStore.removeStoreListener('change');
    UserStore.removeStoreListener('change');
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
        maxHeight={1000}
        headerHeight={40}>
        <Column
          label="Query"
          width={400}
          dataKey="query"
          cellRenderer={getRenderer('query')}
        />
        <Column
          label="Status"
          width={80}
          dataKey="status"
          cellRenderer={getRenderer('status')}
        />
        <Column
          label="Started"
          width={220}
          dataKey="started"
          cellRenderer={getRenderer('started')}
        />
        <Column
          label="Duration"
          width={80}
          dataKey="duration"
        />
        <Column
          label="Output"
          width={180}
          dataKey="output"
          cellRenderer={getRenderer('output')}
        />
      </Table>
    );
  },

  rowGetter(rowIndex) {
    return formatRun(this.state.runs[rowIndex]);
  },

  renderEmptyMessage() {
    return (
      <p className="info text-center">No personal running queries</p>
    );
  },

  /* Store events */
  _onChange() {
    this.setState(getStateFromStore());
  }
});


function formatRun(run) {
  if (!run) return;
  return {
    query: run.query,
    status: run.state,
    started: run.queryStarted,
    duration: run.queryStats.elapsedTime,
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
        <a href={output.location}>
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

module.exports = MyOwnRuns;
