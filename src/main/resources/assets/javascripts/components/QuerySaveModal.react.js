/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var

var QuerySaveModal = React.createClass({
  displayName: 'QuerySaveModal',
  render: function () {
    return (
      <Modal {...this.props} title="Modal heading">
        <div className="modal-body"></div>

        <div className="modal-footer">
            <div>
              <span className="glyphicon glyphicon-repeat"></span> Saving query...
            </div>

            <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" className="btn btn-primary">Save Query</button>
        </div>
      </Modal>
    );
  }
});

module.exports = QuerySaveModal;