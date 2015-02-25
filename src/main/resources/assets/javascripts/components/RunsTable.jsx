import React from 'react/addons';
import _ from 'lodash';
import moment from 'moment';
import QueryActions from '../actions/QueryActions';
import RunActions from '../actions/RunActions';
import RunStore from '../stores/RunStore';
import { Table, Column } from 'fixed-data-table';
import { ProgressBar } from 'react-bootstrap';
import UpdateWidthMixin from '../mixins/UpdateWidthMixin';

let cx = React.addons.classSet;
let isColumnResizing = false;
let columnWidths = {
  user: 80,
  query: 400,
  status: 80,
  started: 220,
  duration: 80,
  output: 180,
};

// State actions
function getRuns(user) {
  if (user) {
    return RunStore.getCollection().where({
      user
    }, {
      sort: true
    })
  } else {
    return RunStore.getCollection().all({
      sort: true
    });
  }
}

let RunsTable = React.createClass({
  displayName: 'RunsTable',
  mixins: [UpdateWidthMixin],

  getStateFromStore() {
    return {
      runs: getRuns(this.props.user)
    };
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  componentDidMount() {
    RunStore.listen(this._onChange);
  },

  componentWillUnmount() {
    RunStore.unlisten(this._onChange);
  },

  render() {
    if (this.state.runs.length === 0) {
      return this.renderEmptyMessage();
    }

    return (
      <div className='flex airpal-table'>
        <Table
          rowHeight={40}
          headerHeight={25}
          rowGetter={this.rowGetter}
          rowsCount={this.state.runs.length}
          width={this.props.tableWidth}
          maxHeight={this.props.tableHeight}
          overflowX='auto'
          overflowY='auto'
          isColumnResizing={isColumnResizing}
          onColumnResizeEndCallback={this.onColumnResizeEndCallback}>
          {getColumns(this.props.user != null)}
        </Table>
      </div>
    );
  },

  onColumnResizeEndCallback(newColumnWidth, dataKey) {
    columnWidths[dataKey] = newColumnWidth;
    isColumnResizing = false;
    this.forceUpdate(); // TODO: move to store + state
  },

  rowGetter(rowIndex) {
    return formatRun(this.state.runs[rowIndex], this.props.user);
  },

  renderEmptyMessage() {
    return (
      <p className="info text-center">
        No queries to show
      </p>
    );
  },

  /* Store events */
  _onChange() {
    this.setState(this.getStateFromStore());
  }
});

function getColumns(forCurrentUser) {
  let i = 0;
  return _.compact([
    (forCurrentUser ? null : <Column
      label="User"
      width={columnWidths.user}
      dataKey="user"
      cellRenderer={getRenderer('user')}
      key={i++}
      isResizable={true} />),
    <Column
      label="Query"
      width={columnWidths.query}
      dataKey="query"
      cellRenderer={getRenderer('query')}
      key={i++}
      isResizable={true}
      flexGrow={2} />,
    <Column
      label="Status"
      width={columnWidths.status}
      dataKey="status"
      cellRenderer={getRenderer('status')}
      key={i++}
      isResizable={true} />,
    <Column
      label="Started"
      width={columnWidths.started}
      dataKey="started"
      cellRenderer={getRenderer('started')}
      key={i++}
      isResizable={true} />,
    <Column
      label="Duration"
      width={columnWidths.duration}
      dataKey="duration"
      key={i++}
      isResizable={true} />,
    <Column
      label="Output"
      width={columnWidths.output}
      dataKey="output"
      cellRenderer={getRenderer('output')}
      key={i++}
      isResizable={true}
      flexGrow={1} />,
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
    _currentUser: currentUser
  };
}


/**
 * Wrap each in a `<div >` so FixedDataTable can add classes to it for padding,
 * etc.
 */
function getRenderer(key) {
  return function wrappedRenderer(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
    let content = CellRenderers[key](cellData, cellDataKey, rowData, rowIndex, columnData, width);
    return (
      <div className="text-overflow-ellipsis" style={{width}}>
        {content}
      </div>
    );
  };
}

function selectQuery(query, e) {
  e.preventDefault();
  QueryActions.selectQuery(query);
}

function killRun(uuid) {
  RunActions.kill(uuid);
}

let CellRenderers = {
  user(cellData) {
    return (
      <span title={cellData}>
        {cellData}
      </span>
    );
  },

  query(query) {
    return (
      <a href="#" onClick={selectQuery.bind(null, query)}>
        <code title={query}>
          {query}
        </code>
      </a>
    );
  },

  status(cellData, cellDataKey, rowData, rowIndex, columnData, width) {
    let run = rowData._run;
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
    let run = rowData._run;
    let currentUser = rowData._currentUser;
    let killable = currentUser && currentUser === run.user;
    let output = cellData;

    if (output && output.location) {
      return (
        <a href={output.location} target="_blank">
          Download CSV
        </a>
      );
    } else if (run.state === 'RUNNING') {
      let running = cx({
        'runs-table-progress': true,
        'runs-table-progress-killable': killable
      });

      let remove = cx({
        'glyphicon': true,
        'glyphicon-remove': true,
        'text-danger': true
      });

      return (
        <div className={running}>
          <ProgressBar now={getProgressFromStats(run.queryStats)} />
          {killable &&
          <span className={remove}
            title="Kill query"
            onClick={killRun.bind(null, run.uuid)} />}
        </div>
        );
    } else if (run.state === 'FAILED') {
      return (
        <span title={run.error.message}>
          {run.error.message}
        </span>
      );
    }
  },

  started(cellData) {
    let m = moment.utc(cellData, 'x');
    let utc = m.format();
    let human = m.format('lll');
    return <span title={utc}>{human} UTC</span>;
  }
};

function getProgressFromStats(stats) {
  if (!stats || !stats.totalTasks || stats.totalTasks == 0) {
    return 0.0;
  } else {
    return Math.max(stats.completedTasks / stats.totalTasks * 100, 3);
  }
}

export default RunsTable;
