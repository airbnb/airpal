/** @jsx React.DOM */

var React = require('react/addons'),
    PartitionedTableSelector = require('../elements/partitioned_table_selector'),
    Editor = require('../elements/editor'),
    Tabs = require('../elements/tabs'),
    QueryHistory = require('../elements/query_history'),
    PreviewQuery = require('../elements/preview_query'),
    SavedQueries = require('../elements/saved_queries'),
    EventEmitter = require('events').EventEmitter,
    SSEConnection = require('../core/sse_connection'),
    _ = require('lodash'),
    cx = React.addons.classSet,
    IndexPage;

function getIn(obj, nestedKey, defaultVal) {
  var dVal = defaultVal || null,
      keys = nestedKey.split('.').reverse(),
      lastVal = obj,
      key;

  while (!_.isUndefined(key = keys.pop())) {
    if (lastVal && lastVal[key]) {
      lastVal = lastVal[key];
    } else {
      return dVal;
    }
  }

  return lastVal;
}

var mediator = new EventEmitter();

IndexPage = React.createClass({
  getDefaultProps: function() {
    return {
      notifyOfSSE: ['previewOutput', 'history'],
    };
  },
  getInitialState: function() {
    return {
      activeSchema: 'default',
      activeTable: null,
      selectedTab: 'history',
      activeQuery: null,
      currentModal: null,
      currentJob: {},
      savedQueries: [],
      permissionLevel: '',
    };
  },
  componentWillMount: function() {
    $.ajax({
      url: '/api/query/saved',
      type: 'GET',
      error: function() {},
      success: function(featuredQueries) {
        if (_.isEmpty(featuredQueries)) {
          return;
        }
        this.setState({
          savedQueries: featuredQueries
        });
      }.bind(this),
    });
    $.ajax({
      url: '/api/execute/permissions',
      type: 'GET',
      success: function(data) {
        this.setState({
          canCreateTable: data.canCreateTable,
          userName: data.userName,
          accessLevel: data.accessLevel,
        });
      }.bind(this),
    });

    var sseConnection = new SSEConnection();
    sseConnection.on('stateTransition', function(transition) {
    }).on('message', function(data) {
      var parsed, job;
      try {
        parsed = JSON.parse(data);
        job = parsed.job;
      } catch (e) {
        console.log('Could not parse json data', e, e.message, 'data\n', data);
      }

      _.each(this.props.notifyOfSSE, function(ref) {
        this.refs[ref].handleSSEEvent(parsed, job);
      }.bind(this));
    }.bind(this));
    sseConnection.connect();

    this.connection = sseConnection;
  },
  render: function() {
    var queryLines;

    if (getIn(this.state, 'currentJob.query') != null) {
      queryLines = _.map(this.state.currentJob.query.split('\n'), function(line, i) {
        return (<span key={'query-line-' + i} className="line">{line}</span>);
      });
    }
    return (<div>
      <header className="row-space-1 row-space-top-2">
        <div className="col-4 pull-right">
          <a href="#"
             className="btn pull-right"
             id="start-tour">Take Tour</a>
          <dl className="col-4">
            <dt>User Name</dt>
            <dd>{this.state.userName}</dd>
          </dl>
          <dl className="col-4">
            <dt>Access Level &nbsp;
              <a href="https://airbnb.hackpad.com/Airpal-9FiIU3O2BJ1#:h=Access-Levels"
                 target="_blank">
                <i className="icon icon-question"></i>
              </a>
            </dt>
            <dd>{this.state.accessLevel}</dd>
          </dl>
        </div>
        <h1 className="text-special">Airpal</h1>
      </header>
      <PartitionedTableSelector
          onActiveTable={this.handleActiveTable}
          activeTable={this.state.activeTable}
          activeSchema={this.state.activeSchema} />
      <Editor
        ref="editor"
        onQueryRun={this.handleQueryRun}
        onQuerySave={this.handleQuerySave} />
      <div className="row-12 row-space-top-2 row-space-5">
        <Tabs
          selected={this.state.selectedTab}
          onTabChange={this.handleTabChange}>
          <QueryHistory
                  ref='history'
                  tabTitle='History'
                  onQuerySelected={this.handleQuerySelected}
                  onTableSelected={this.handleTableSelected}
                  onErrorSelected={this.handleErrorSelected}
                  emitter={mediator} />
          <SavedQueries
                  tabTitle='Saved'
                  queries={this.state.savedQueries}
                  onQuerySelected={this.handleQuerySelected}
                  onQueryDeleted={this.handleSavedQueryDeleted}
                  onQueryRun={this.handleSavedQueryRun} />
          <PreviewQuery
                  ref='previewOutput'
                  tabTitle='Output'
                  previewData={[]}
                  emitter={mediator} />
        </Tabs>
      </div>

      <div className="modal"
           aria-hidden={this.state.currentModal !== 'error'}
           ref="errorModal">
        <div className="modal-table">
          <div className="modal-cell">
            <div className="modal-content">
              <div className="panel-header">
                <a href="#" className="panel-close" onClick={this.handleCloseModal}></a>
                Error Message
              </div>
              <div className="panel-body">
                <pre className="o2-code" id="error-query">
                  {queryLines}
                </pre>
                <p id="error-message">
                  {getIn(this.state.currentJob, 'error.message')}
                </p>
              </div>
              <div className="panel-footer">
                <button className="btn" onClick={this.handleCloseModal}>
                  Close modal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal" role="dialog" aria-hidden="true" ref="disconnectedModal">
        <div className="modal-table">
          <div className="modal-cell">
            <div className="modal-content">
              <div className="panel-header">
                <a href="#" className="panel-close" data-behavior="modal-close"></a>
                Disconnected from Airpal!
              </div>
              <div className="panel-body">
                <div className="server-500 hide">
                  <p>Airpal is not responding correctly. We're trying to reconnect, but you might have to refresh.</p>
                </div>
                <div className="server-401 hide">
                  <p>You have become logged out of Airpal. Please <a href="/login">click here to log back in.</a></p>
                </div>
                <div className="server-offline hide">
                  <p>You are currently offline, and won't be able to use Airpal. Please reconnect to use Airpal.</p>
                </div>
              </div>
              <div className="panel-footer">
                <button className="btn" data-behavior="modal-close">
                  Close modal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  },
  handleQuerySelected: function(query) {
    this.refs.editor.setValue(query);
  },
  handleTableSelected: function(table) {
  },
  handleErrorSelected: function(job) {
    this.setState({
      currentModal: 'error',
      currentJob: job,
    });
  },
  handleActiveTable: function(schema, table, partition) {
    this.setState({
      activeSchema: schema,
      activeTable: table,
    });
  },
  handleTabChange: function(panel) {
    this.setState({
      selectedTab: panel.props.tabTitle,
    });
  },
  handleCloseModal: function(e) {
    e.preventDefault();
    this.setState({
      currentModal: null,
    });
  },
  handleQueryRun: function(query) {
  },
  handleSavedQueryRun: function(query) {
    this.handleQuerySelected(query.queryWithPlaceholders.query);
    this.refs.editor.handleRunClick();
    this.setState({
      selectedTab: 'history',
    });
  },
  handleQuerySave: function(savedQuery) {
    console.log('handleQuerySave', savedQuery, 'savedQueries', this.state.savedQueries);
    this.setState({
      savedQueries: [savedQuery].concat(this.state.savedQueries),
    });
  },
  handleSavedQueryDeleted: function(uuid) {
    this.setState({
      savedQueries: _.reject(this.state.savedQueries, function(q) {
        return q.uuid === uuid;
      }),
    });
  },
});

module.exports = IndexPage;
