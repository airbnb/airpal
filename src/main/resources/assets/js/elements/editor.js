/** @jsx React.DOM */

var React = require('react/addons'),
    QueryEditor = require('./query_editor'),
    SavedQueryForm = require('./saved_query_form'),
    _ = require('lodash'),
    cx = React.addons.classSet,
    Editor;

function hasMultipleStatements(queryData) {
  var statementTerminateRE = /;$/m,
      newLineRE = /\r?\n/,
      queryStatements = _.reject(
        queryData.replace(newLineRE, '').split(statementTerminateRE),
        function(val) {
          return _.isEmpty(val);
        }),
      newQuery;

  return (queryStatements.length >= 2 && !_.isEmpty(queryStatements[1]));
}

Editor = React.createClass({
  getInitialState: function() {
    return {
      showAlert: this.props.showAlert,
      runText: this.props.runText,
      saveModalOpen: false,
      modalQuery: '',
      querySaving: false,
    };
  },
  getDefaultProps: function() {
    return {
      showAlert: false,
      runText: 'Query',
      onQueryRun: function(query) {},
      onQuerySave: function(savedQuery) {},
    };
  },
  render: function() {
    var alertClasses = cx({
      'panel-header': true,
      'alert': true,
      'alert-header': true,
      'alert-danger': true,
      'hide': !this.state.showAlert
    }), saveIconClasses = cx({
      'save-loading': true,
      'hide': !this.state.querySaving,
    });

    return (<div>
      <div className="row-12 row-space-top-2">
        <div className="panel query-panel">
          <div>
            <div className="panel-header">Query</div>
            <p className={alertClasses} role="alert">
                <a href="#" className="alert-close" onClick={this.handleCloseAlert}></a>
                Airpal does not currently support multiple
                <span className="header-tip"
                      data-behavior="tooltip"
                      data-position="top"
                      title="A statement is a SQL expression terminated by a semicolon (;)">statements</span>
                    in a query. Please re-phrase your query and try again.
            </p>
          </div>
          <QueryEditor
              defaultQuery="SELECT COUNT(1) FROM users"
              onSelection={this.handleEditorSelection}
              ref="editor" />
        </div>
      </div>
      <div className="row-12 row-space-top-2 clearfix">
        <div className="col-6 pull-left run-query-form run-query">
          <input ref="tempTable" class="pull-left" placeholder="Temporary Table Name" type="text"/>
        </div>
        <div className="pull-right">
          <button
            className="btn btn-primary btn-large"
            onClick={this.handleSaveClick}>Save {this.state.runText}</button>
          <button
            className="btn btn-primary btn-large"
            onClick={this.handleRunClick}>Run {this.state.runText}</button>
        </div>
      </div>
      <div className="modal"
           aria-hidden={!this.state.saveModalOpen}
           ref="saveQueryModal">
        <div className="modal-table">
          <div className="modal-cell">
            <div className="modal-content">
              <div className="panel-header">
                <a href="#" className="panel-close" onClick={this.handleCloseModal}></a>
                Save Query
              </div>
              <div className="panel-body">
                <SavedQueryForm
                  query={this.state.modalQuery}
                  onSubmit={this.handleSaveSubmit}
                  ref="savedQueryForm"
                  context="Save" />
              </div>
              <div className="panel-footer">
                <div className={saveIconClasses}>
                  <i className="icon icon-repeat"></i>
                </div>
                <button className="btn" onClick={this.handleCloseModal}>Cancel</button>
                <button className="btn btn-primary" onClick={this.handleSaveSubmit}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  },

  handleCloseAlert: function(e) {
    e.preventDefault();
    this.setState({showAlert: false});
  },
  checkStatement: function() {
    var hasMultiple = hasMultipleStatements(this.refs.editor.getValue()) && false;
    console.log('check statement', 'has multiple', hasMultiple, this, arguments);
    this.setState({
      showAlert: hasMultiple
    });
  },
  handleSaveClick: function(e) {
    this.checkStatement();
    e.preventDefault();

    this.setState({
      modalQuery: this.refs.editor.getQuery(),
      saveModalOpen: true,
    });
  },
  handleEditorSelection: function(isRange, query) {
    this.setState({
      runText: isRange ? 'Selected' : 'Query',
    });
  },
  handleRunClick: function(e) {
    var tmpTable = this.refs.tempTable.getDOMNode().value;

    console.log('handleRunClick', this, arguments);
    this.checkStatement();
    e && e.preventDefault();

    $.ajax({
      url: '/api/execute',
      type: 'PUT',
      contentType: 'application/json',
      error: function() {
        console.log('Saw error from EXECUTE', arguments);
      },
      success: function(data) {
        if (_.isEmpty(data) || _.isEmpty(data.uuid)) {
          return;
        }
        this.setState({
          activeQuery: data.uuid,
        });
      }.bind(this),
      data: JSON.stringify({
        query: this.refs.editor.getQuery(),
        tmpTable: _.isEmpty(tmpTable) ? null : tmpTable
      })
    });
  },
  handleCloseModal: function(e) {
    e.preventDefault();
    this.setState({
      saveModalOpen: false,
    });
  },
  handleSaveSubmit: function(e) {
    e && e.preventDefault();
    this.setState({ querySaving: true });

    var name = this.refs.savedQueryForm.refs.name.getDOMNode().value,
        description = this.refs.savedQueryForm.refs.description.getDOMNode().value,
        query = this.refs.savedQueryForm.props.query;

    console.log('[Editor#handleSaveSubmit]', name, description, query, e, this);

    $.ajax({
      url: '/api/query/saved',
      type: 'POST',
      data: {
        query: query,
        name: name,
        description: description
      }
    }).done(function(data, textStatus, jqXHR) {
      this.setState({
        saveModalOpen: false,
      });
      this.props.onQuerySave({
        queryWithPlaceholders: {query: query},
        description: description,
        name: name,
        uuid: data,
      });
    }.bind(this)).fail(function(jqXHR, textStatus, errorThrown) {
      console.log('save query failed', jqXHR, textStatus, errorThrown);
    }).always(function(dataOrJqXHR, textStatus, jqXHROrErrorThrown) {
      this.setState({ querySaving: false });
    }.bind(this));
  },
  setValue: function(value) {
    return this.refs.editor.setValue(value);
  },
});

module.exports = Editor;
