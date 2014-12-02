/** @jsx React.DOM */
var React = require('react');

/* Helpers */
var CodeMirror = require('codemirror');
require('codemirror/mode/sql/sql');

var Modal         = require('react-bootstrap').Modal,
    ModalTrigger  = require('react-bootstrap').ModalTrigger;

var QueryEditor = React.createClass({
  displayName: 'QueryEditor',

  componentDidMount: function() {
    CodeMirror.fromTextArea(this.refs.queryEditor.getDOMNode(), {
      lineNumbers: true,
      tabSize: 2,
      mode: 'text/x-mysql',
      theme: 'blackboard'
    });
  },

  render: function () {
    return (
      <div className="row spaced">
        <div className="col-sm-12">

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Query editor</h3>
            </div>
            <div className="panel-body">
              <div className="col-sm-12">
                <textarea ref="queryEditor" name="query-editor"></textarea>
              </div>
            </div>
          </div>

        </div>

        <div className="col-sm-12">
          <div className="row">

            <div className="col-sm-6">
              <input ref="customName" type="text" name="custom-name" className="form-control" placeholder="Select a custom table name" />
            </div>

            <div className="col-sm-6">
              <div className="btn-toolbar pull-right">
                <div className="btn-group">
                  <ModalTrigger>
                    <button className="btn btn-primary">Save Query</button>
                  </ModalTrigger>
                </div>

                <div className="btn-group">
                  <button className="btn btn-success">Run Query</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
});

module.exports = QueryEditor;