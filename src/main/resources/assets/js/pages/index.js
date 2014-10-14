/** @jsx React.DOM */
var React                     = require('react'),

    // Partials
    Header                    = require('./partials/_header'),
    PartitionedTableSelector  = require('./partials/_partitioned_table_selector'),

    // Elements
    Editor                    = require('../elements/editor'),
    QueryHistory              = require('../elements/query_history'),
    PreviewQuery              = require('../elements/preview_query'),
    SavedQueries              = require('../elements/saved_queries'),
    TabbedArea                = require('../elements/tabbed_area'),
    TabPane                   = require('../elements/tab_pane'),

    // Third party libs
    EventEmitter              = require('events').EventEmitter,
    _                         = require('lodash'),
    keymaster                 = require('keymaster');

var mediator = new EventEmitter();

var IndexPage = React.createClass({

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

    // Get the previously saved queries
    this._getSavedQueries();

    // Check the permissions
    this._getUserPermissions();

    // Bind several keys strokes
    keymaster('backspace', this.handleBackspace);
    keymaster('⌘+r, ctrl+r', this.handleRun);
  },

  componentWillUnmount: function() {
    keymaster.unbind('backspace', this.handleBackspace);
    keymaster.unbind('⌘-r, ctrl-r', this.handleRun);
  },

  render: function() {
    var queryLines;

    if (this._getIn(this.state, 'currentJob.query') != null) {
      queryLines = _.map(this.state.currentJob.query.split('\n'), function(line, i) {
        return (<span key={'query-line-' + i} className="line">{line}</span>);
      });
    }

    return (<div>
      <Header ref="header" userName={this.state.userName} accessLevel={this.state.accessLevel} />

      <PartitionedTableSelector ref="partitionedTableSelector" onActiveTable={this.handleActiveTable} activeTable={this.state.activeTable} activeSchema={this.state.activeSchema} />

      <Editor ref="editor" onQueryRun={this.handleQueryRun} onQuerySave={this.handleQuerySave} />

      <div className="row">
        <TabbedArea name="queries" selectedTab={this.state.selectedTab} onTabChange={this.handleTabChange}>

          <TabPane key={1} name="History">
            <QueryHistory onQuerySelected={this.handleQuerySelected} onTableSelected={this.handleTableSelected} onErrorSelected={this.handleErrorSelected} emitter={mediator} />
          </TabPane>

          <TabPane key={2} name="Saved Queries">
            <SavedQueries queries={this.state.savedQueries} onQuerySelected={this.handleQuerySelected} onQueryDeleted={this.handleSavedQueryDeleted} onQueryRun={this.handleSavedQueryRun} />
          </TabPane>

        </TabbedArea>
      </div>

      <div className="modal" aria-hidden={this.state.currentModal !== 'error'} ref="errorModal">
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
                  {this._getIn(this.state.currentJob, 'error.message')}
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

  /* Internal helpers ------------------------------------------------------- */
  _getIn: function(obj, nestedKey, defaultVal) {
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
  },

  _getSavedQueries: function() {
    $.ajax({
      url: '/api/query/saved',
      type: 'GET',
      error: function() {},
      success: function(featuredQueries) {
        if (_.isEmpty(featuredQueries)) { return; }

        // Add the saved queries in the savedQueries state
        this.setState({ savedQueries: featuredQueries });
      }.bind(this)
    });
  },

  _getUserPermissions: function() {
    $.ajax({
      url: '/api/execute/permissions',
      type: 'GET',
      success: function(data) {
        this.setState({
          canCreateTable: data.canCreateTable,
          userName: data.userName,
          accessLevel: data.accessLevel,
        });
      }.bind(this)
    });
  },

  /* Event Handlers --------------------------------------------------------- */
  handleQuerySelected: function(query) {
    this.refs.editor.setValue(query);
  },

  handleTableSelected: function(table) {},

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

  handleTabChange: function(tab) {
    this.setState({
      selectedTab: tab.props.name,
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

    // Set the selected tab to history
    this.setState({ selectedTab: 'history' });
  },

  handleQuerySave: function(savedQuery) {

    // Add the newly saved query to the state
    this.setState({ savedQueries: [savedQuery].concat(this.state.savedQueries) });
  },

  handleSavedQueryDeleted: function(uuid) {
    this.setState({
      savedQueries: _.reject(this.state.savedQueries, function(q) {
        return q.uuid === uuid;
      }),
    });
  },

  handleBackspace: function($event, handler) {
    if (handler.scope === 'all') { $event.preventDefault(); }
  },

  handleRun: function($event, handler) {
    $event.preventDefault();
    this.refs.editor.handleRunClick();
  }
});

module.exports = IndexPage;
