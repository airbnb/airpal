/** @jsx React.DOM */
var React = require('react');

/* Actions */
var QueryActions = require('../actions/QueryActions');

/* Helpers */
var Modal = require('react-bootstrap').Modal;

/* Stores */
var QueryStore = require('../stores/QueryStore');

var QuerySaveModal = React.createClass({
  displayName: 'QuerySaveModal',

  componentDidMount: function() {
    QueryStore.addStoreListener('create', this._disableSubmitButton);
  },

  componentWillUnmount: function() {
    QueryStore.removeStoreListener('create', this._disableSubmitButton);
  },

  render: function () {
    return (
      <Modal {...this.props} title="Save a new query">
        <div className="modal-body">
          <form className="form-horizontal" action="#" onSubmit={this.handleSaveRequest}>

            <pre>{this.props.query}</pre>

            <div className="form-group">
              <label className="col-sm-4 text-right" htmlFor="query-name">Query Name</label>
              <div className="col-sm-8">
                <input ref="name" name="query-name" type="text" className="form-control" />
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-4 text-right" htmlFor="query-description">Query Description</label>
              <div className="col-sm-8">
                <textarea ref="description" rows="4" name="query-description" className="form-control"></textarea>
              </div>
            </div>

          </form>
        </div>

        <div className="modal-footer">
            <div ref="saveQueryIndicator" className="indicator hidden">
              <span className="glyphicon glyphicon-repeat indicator-spinner"></span> Saving query...
            </div>

            <button type="button" className="btn btn-default" onClick={this.props.onRequestHide}>Cancel</button>
            <button ref="submitButton" type="button" className="btn btn-primary" onClick={this.handleSaveRequest}>Save Query</button>
        </div>
      </Modal>
    );
  },

  handleSaveRequest: function(event) {
    event.preventDefault();

    // Extract the data from the view and pass the data to the
    // view action to create a new query
    var name = this.refs['name'].getDOMNode().value,
        description = this.refs['description'].getDOMNode().value;
    if ( name == '' ) return;

    // Start the "saving process"
    $(this.refs['saveQueryIndicator'].getDOMNode()).removeClass('hidden');

    // Send the data await
    QueryActions.createQuery({
      query: this.props.query,
      name: name,
      description: description
    });
  },

  // - Internal helpers --------------------------------------------------- //
  // Makes sure the submit button is disabled
  _disableSubmitButton: function() {
    var button = this.refs.submitButton.getDOMNode();
    button.setAttribute('disabled', true);
  }
});

module.exports = QuerySaveModal;