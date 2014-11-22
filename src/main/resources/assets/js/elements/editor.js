/** @jsx React.DOM */
var React           = require('react/addons'),
    QueryEditor     = require('./query_editor'),
    SavedQueryForm  = require('./saved_query_form'),
    _               = require('lodash'),
    ErrorMessage    = require('./error_message');

var Editor = React.createClass({
  getInitialState: function() {
    return {
      runText: this.props.runText,
      modalQuery: '',
      querySaving: false
    };
  },

  getDefaultProps: function() {
    return { runText: 'Query' };
  },

  // Remove the error messages so we can start clean
  componentDidMount: function() {
    $('#saveQueryModal').on('hide.bs.modal', function($event) {
      this.refs['error-message'].clearMessages('save-modal');
    }.bind(this));
  },

  render: function() {

    // Set the right CSS classes
    this._updateCSSClasses();

    // Return the template
    return (
      <div className="row">

        <div className="col-sm-12">
          <div className="panel panel-default query-panel">

            <div className="panel-heading">
              <strong>Query</strong>
            </div>

            <div className="panel-body">
              <QueryEditor ref="editor" defaultQuery="SELECT COUNT(1) FROM users" onSelection={this.handleEditorSelection} />
            </div>

          </div>
        </div>

        <div className="col-sm-12">
          <div className="row">

            <div className="col-sm-6 text-left run-query-form run-query">
              <input ref="tempTable" className="form-control pull-left" placeholder="Temporary Table Name" type="text" />
            </div>

            <div className="col-sm-6 text-right">
              <button type="button" className="btn btn-primary" onClick={this.handleOpenModal}>Save {this.state.runText}</button>
              <button type="button" className="btn btn-primary" onClick={this.handleRunClick}>Run {this.state.runText}</button>
            </div>

          </div>
        </div>

        <div id="saveQueryModal" ref="saveQueryModal" className="modal fade"  tabindex="-1" role="dialog" aria-labelledby="saveQueryModal" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">
                  <span aria-hidden="true">&times;</span> <span className="sr-only">Close</span>
                </button>

                <h4 className="modal-title">Save Query</h4>
              </div>

              <div className="modal-body">
                <ErrorMessage ref="error-message" position="save-modal" />
                <SavedQueryForm ref="savedQueryForm" query={this.state.modalQuery} onSaveSubmit={this.handleSaveSubmit} context="Save" />
              </div>

              <div className="modal-footer">
                  <div className={this.classes.icon}>
                    <span className="glyphicon glyphicon-repeat"></span> Saving query...
                  </div>

                  <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={this.handleSaveSubmit}>Save Query</button>
              </div>

            </div>
          </div>
        </div>

      </div>
    );
  },

  /* Internal Helpers ------------------------------------------------------- */
  _updateCSSClasses: function() {
    this.classes || (this.classes = {})

    // Set all the save icon classes
    this.classes['icon'] = React.addons.classSet({
      'save-loading': true,
      'pull-left': true,
      'hide': !this.state.querySaving
    });
  },

  _hasMultipleStatements: function(queryData) {
    var statementTerminateRE = /;$/m,
        newLineRE = /\r?\n/,
        queryStatements = _.reject(
          queryData.replace(newLineRE, '').split(statementTerminateRE),
          function(val) {
            return _.isEmpty(val);
          }),
        newQuery;

    return (queryStatements.length >= 2 && !_.isEmpty(queryStatements[1]));
  },

  _checkStatement: function() {
    if( !this._hasMultipleStatements(this.refs.editor.getValue()) ) { return true; }

    // There are multiple statements, so show an error to the user
    Mediator.emit('newError', 'Airpal does not currently support multiple <a href="#" data-toggle="tooltip" title="A statement is a SQL expression terminated by a semicolon (;)">statements</a> in a query. Please re-phrase your query and try again.');

    // Prevent the parent function from continuing
    return false;
  },

  /* Event Handlers --------------------------------------------------------- */
  handleOpenModal: function($event) {
    $event.preventDefault();
    this._checkStatement(); // Check if we should continue

    // Grab the current query for the modal
    this.setState({ modalQuery: this.refs.editor.getQuery() })

    // Get the modal and open it
    var modal = this.refs.saveQueryModal.getDOMNode();
    $(modal).modal('show');
  },

  handleEditorSelection: function(isRange, query) {
    this.setState({
      runText: isRange ? 'Selected' : 'Query',
    });
  },

  handleRunClick: function($event) {
    $event.preventDefault();
    this._checkStatement(); // Check if we should continue

    // Get tje temporary table
    var tmpTable = this.refs.tempTable.getDOMNode().value;

    // Make the execute call
    $.ajax({
      url: '/api/execute',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        query: this.refs.editor.getQuery(),
        tmpTable: _.isEmpty(tmpTable) ? null : tmpTable
      }),

      error: function(xhr, status, message) {
        Mediator.emit('newError', 'Could not execute the new query because of <strong>' + message + '</strong>');
      },

      success: function(data) {
        if (_.isEmpty(data) || _.isEmpty(data.uuid)) { return; }

        // Set the active query state
        this.setState({ activeQuery: data.uuid });
      }.bind(this)
    });
  },

  handleSaveSubmit: function($event) {
    $event.preventDefault();

    // Show the user that the request is pending by setting
    // the querySaving state to true
    this.setState({ querySaving: true });

    // Get the data to submit
    var refs        = this.refs.savedQueryForm.refs,
        name        = refs.name.getDOMNode().value,
        description = refs.description.getDOMNode().value,
        query       = this.refs.savedQueryForm.props.query;

    // Post the query to save it
    $.ajax({
      url: '/api/query/saved',
      type: 'POST',
      data: {
        query: query,
        name: name,
        description: description
      },

      success: function() {

        // Notify the parent that the query has been
        // saved to the server
        this.props.onQuerySave({
          queryWithPlaceholders: { query: query },
          description: description,
          name: name,
          uuid: data
        });

        // Get the modal and close it
        var modal = this.refs.saveQueryModal.getDOMNode();
        $(modal).modal('hide');
      }.bind(this),

      error: function(xhr, status, message) {
        Mediator.emit('newError', 'Could not save the query because of <strong>' + message + '</strong>', 'save-modal');
      }.bind(this)

    }).always(function() {

      // Stop notifying the user the request is pending
      this.setState({ querySaving: false });
    }.bind(this));
  }
});

module.exports = Editor;
