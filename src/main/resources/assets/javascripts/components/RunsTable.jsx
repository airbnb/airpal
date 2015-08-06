import React from 'react/addons';
import _ from 'lodash';
import moment from 'moment';
import QueryActions from '../actions/QueryActions';
import ResultsPreviewActions from '../actions/ResultsPreviewActions';
import RunActions from '../actions/RunActions';
import TabActions from '../actions/TabActions';
import TableActions from '../actions/TableActions';
import TabConstants from '../constants/TabConstants';
import RunStateConstants from '../constants/RunStateConstants';
import RunStore from '../stores/RunStore';
import { Table, Column } from 'fixed-data-table';
import { Modal, ModalTrigger, ProgressBar } from 'react-bootstrap';
import UpdateWidthMixin from '../mixins/UpdateWidthMixin';

let cx = React.addons.classSet;
let isColumnResizing = false;
let columnWidths = {
  user: 180,
  query: 400,
  status: 90,
  started: 220,
  duration: 80,
  output: 230,
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

let ErrorModal = React.createClass({
  render() {
    return (
      <Modal {...this.props} title="Error" animation={false}>
        <div className="modal-body">
          {this.props.message}
        </div>
      </Modal>
    );
  }
});

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

//    Need to make sure to wrap `Table` in a parent element so we can
//    compute the natural width of the component.
    return (
      <div className='flex airpal-table'>
        <Table
          headerHeight={25}
          rowHeight={40}
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
      <p className="info panel-body text-light text-center">No queries to show</p>
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
      isResizable={true}
      minWidth={5}
    />),
    <Column
      label="Query"
      width={columnWidths.query}
      dataKey="query"
      cellRenderer={getRenderer('query')}
      key={i++}
      isResizable={true}
      minWidth={5}
    />,
    <Column
      label="Status"
      width={columnWidths.status}
      dataKey="status"
      cellRenderer={getRenderer('status')}
      key={i++}
      isResizable={true}
      minWidth={5}
    />,
    <Column
      label="Started"
      width={columnWidths.started}
      dataKey="started"
      cellRenderer={getRenderer('started')}
      key={i++}
      isResizable={true}
      minWidth={5}
    />,
    <Column
      label="Duration"
      width={columnWidths.duration}
      dataKey="duration"
      key={i++}
      isResizable={true}
      minWidth={5}
    />,
    <Column
      label="Output"
      width={columnWidths.output}
      dataKey="output"
      cellRenderer={getRenderer('output')}
      key={i++}
      isResizable={true}
      minWidth={5}
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
    return <div className="text-overflow-ellipsis" style={{
      width
    }}>{content}</div>;
  };
}

function selectQuery(query, e) {
  e.preventDefault();
  QueryActions.selectQuery(query);
}

function selectTable(table, e) {
  e.preventDefault();
  TableActions.addTable({
    name: table
  });
  TableActions.selectTable(table);
  TabActions.selectTab(TabConstants.DATA_PREVIEW);
}

function previewQueryResult(file, query, e) {
  e.preventDefault();
  ResultsPreviewActions.loadResultsPreview(file);
  ResultsPreviewActions.selectPreviewQuery(query);
  TabActions.selectTab(TabConstants.RESULTS_PREVIEW);
}

function killRun(uuid) {
  RunActions.kill(uuid);
}

let CellRenderers = {
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
    let run = rowData._run;
    if (run.state === RunStateConstants.FAILED) {
      return (<span className="label label-danger">FAILED</span>);
    } else if (run.state === RunStateConstants.FINISHED) {
      return (<span className="label label-success">{run.state}</span>);
    } else if (run.state === RunStateConstants.QUEUED) {
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
    if (output && output.location && (run.state !== RunStateConstants.FAILED)) {
      if (output.location[0] === '/' || output.location.indexOf('http') != -1) {
        return (
          <div>
            <a href={output.location} target="_blank" className='btn'>
              Download CSV
              <i className='glyphicon glyphicon-download' />
            </a>
            <a
              href="#"
              onClick={previewQueryResult.bind(
                null,
                output.location,
                run.query
              )}
              className='btn'>
              Preview Results
            </a>
          </div>
        );
      } else {
        return (
          <a href="#" onClick={selectTable.bind(null, output.location)}>
            <code title={output.location}>{output.location}</code>
          </a>
        );
      }
    } else if (run.state === 'RUNNING') {
      return (
        <div className={cx({
          'runs-table-progress': true,
          'runs-table-progress-killable': killable
        })}>
          <ProgressBar now={getProgressFromStats(run.queryStats)} />
          {killable ?
            <span className="glyphicon glyphicon-remove text-danger"
              title="Kill query"
              onClick={killRun.bind(null, run.uuid)}></span>
          : null}
        </div>
        );

    // XXX this needs to be a modal...we can use a custom modal here or something experimental
    } else if (run.state === RunStateConstants.FAILED) {
      return (
        <ModalTrigger modal={<ErrorModal message={run.error.message} />}>
          <span title={run.error.message}>{run.error.message}</span>
        </ModalTrigger>
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
