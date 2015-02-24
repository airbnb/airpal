import React from 'react';
import QueryActions from '../actions/QueryActions';
import { Modal } from 'react-bootstrap';

let QuerySaveModal = React.createClass({
  displayName: 'QuerySaveModal',

  componentDidMount() {
    this.refs.name.getDOMNode().focus();
  },

  render() {
    return (
      <Modal {...this.props} title="Save a new query">
        <div className="modal-body query-save-modal">
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

  handleSaveRequest(event) {
    event.preventDefault();

    let name = this.refs.name.getDOMNode().value;
    let description = this.refs.description.getDOMNode().value;

    if (name === '') {
      return;
    }

    // Start the "saving process"
    $(this.refs['saveQueryIndicator'].getDOMNode()).removeClass('hidden');

    // Send the data await
    QueryActions.createQuery({
      query: this.props.query,
      name,
      description
    });
  }
});

export default QuerySaveModal;
