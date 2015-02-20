/** @jsx React.DOM */
var React   = require('react/addons');
var _       = require('lodash');
var moment  = require('moment');
var cx      = React.addons.classSet;

/* Actions */
var QueryActions = require('../actions/QueryActions');
var RunActions   = require('../actions/RunActions');

/* Stores */
var RunStore  = require('../stores/RunStore');

/* FixedDataTable */
var { Table, Column } = require('fixed-data-table');

/* Bootstrap */
var { ProgressBar } = require('react-bootstrap');

/* Mixins */
var UpdateWidthMixin = require('../mixins/UpdateWidthMixin');

// State actions
function getRuns(user) {
  if (user) {
    return RunStore.where({user: user}, {sort: true})
  } else {
    return RunStore.all({sort: true});
  }
}

var RunsTable = React.createClass({
  displayName: 'RunsTable',

  mixins: [UpdateWidthMixin],

  getStateFromStore() {
    return {
      runs: getRuns(this.props.user),
    };
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  componentDidMount() {
    RunStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount() {
    // Remove the store listeners
    RunStore.removeStoreListener('change', this._onChange);
  },

  render() {
    if (this.state.runs.length === 0) {
      return this.renderEmptyMessage();
    }

    return (
      <div>
        {/*
          Need to make sure to wrap `Table` in a parent element so we can
          compute the natural width of the component.
        */}
        <Table
          rowHeight={40}
          rowGetter={this.rowGetter}
          rowsCount={this.state.runs.length}
          width={this.state.width}
          maxHeight={400}
          ownerHeight={400}
          headerHeight={40}>
          {getColumns(this.props.user != null)}
        </Table>
      </div>
    );
  },

  rowGetter(rowIndex) {
    return formatRun(this.state.runs[rowIndex], this.props.user);
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
});

function getColumns(forCurrentUser) {
  var i = 0;
  return _.compact([
    (forCurrentUser ? null : <Column
      label="User"
      width={80}
      dataKey="user"
      cellRenderer={getRenderer('user')}
      key={i++}
    />),
    <Column
      label="Query"
      width={forCurrentUser ? 400 : 320}
      dataKey="query"
      cellRenderer={getRenderer('query')}
      key={i++}
    />,
    <Column
      label="Status"
      width={80}
      dataKey="status"
      cellRenderer={getRenderer('status')}
      key={i++}
    />,
    <Column
      label="Started"
      width={220}
      dataKey="started"
      cellRenderer={getRenderer('started')}
      key={i++}
    />,
    <Column
      label="Duration"
      width={80}
      dataKey="duration"
      key={i++}
    />,
    <Column
      label="Output"
      width={180}
      dataKey="output"
      cellRenderer={getRenderer('output')}
      key={i++}
    />,
  ]);
}

function formatRun(run, currentUser) {
  if (!run) return;
  return {
    user: run.user,
    query: run.query,
    status: run.state,
    started: run.queryStarted,
    duration: run.queryStats && run.queryStats.elapsedTime,
    output: run.output && run.output,
    _run: run,
    _currentUser: currentUser,
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

function selectQuery(query, e) {
  e.preventDefault();
  QueryActions.selectQuery(query);
}

function killRun(uuid) {
  RunActions.kill(uuid);
}

var CellRenderers = {
  user(cellData) {
    return <span title={cellData}>{cellData}</span>;
  },

  query(query) {
    return (
      <a href="#" onClick={selectQuery.bind(null, query)}>
        <code title={query}>{query}</code>
      </a>
    );
  },

  status(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
    var run = rowData._run;
    if (run.state === 'FAILED') {
      return (<span className="label label-danger">FAILED</span>);
    } else if (run.state === 'FINISHED') {
      return (<span className="label label-success">{run.state}</span>);
    } else if (run.state === 'QUEUED') {
      return (<span className="label label-default">{run.state}</span>);
    } else {
      return (<span className="label label-info">{run.state}</span>);
    }
  },

  output(cellData, cellDataKey, rowData) {
    var run = rowData._run;
    var currentUser = rowData._currentUser;
    var killable = currentUser && currentUser === run.user;
    var output = cellData;
    if (output && output.location) {
      return (
        <a href={output.location} target="_blank">
          Download CSV
        </a>
      );
    } else if (run.state === 'RUNNING') {
      return (
        <div className={cx({
          'runs-table-progress': true,
          'runs-table-progress-killable': killable,
        })}>
          <ProgressBar now={getProgressFromStats(run.queryStats)} />
          {killable ?
            <span className="glyphicon glyphicon-remove text-danger"
              title="Kill query"
              onClick={killRun.bind(null, run.uuid)}></span>
          : null}
        </div>
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

function getProgressFromStats(stats) {
  if (!stats || !stats.totalTasks || stats.totalTasks == 0) {
    return 0.0;
  } else {
    return Math.max(stats.completedTasks / stats.totalTasks * 100, 3);
  }
}

module.exports = RunsTable;
