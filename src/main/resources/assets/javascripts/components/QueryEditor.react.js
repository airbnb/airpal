/** @jsx React.DOM */
var React = require('react');

/* Views */
var QuerySaveModal = require('./QuerySaveModal.react');

/* Helpers */
var CodeMirror = require('codemirror'),
    OverlayMixin  = require('react-bootstrap').OverlayMixin;

require('codemirror/mode/sql/sql');

var QueryEditor = React.createClass({
  displayName: 'QueryEditor',
  mixins: [OverlayMixin],

  componentDidMount: function() {
    this.editor = CodeMirror.fromTextArea(this.refs.queryEditor.getDOMNode(), {
      lineNumbers: true,
      tabSize: 2,
      mode: 'text/x-mysql',
      theme: 'blackboard'
    });
  },

  getInitialState: function() {
    return { isModalOpen: false };
  },

  handleToggle: function () {
    this.setState({
      isModalOpen: !this.state.isModalOpen
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

            <div className="col-sm-6 text-right">
              <div className="btn-toolbar pull-right">
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={this.handleToggle}>Save Query</button>
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
  },

  renderOverlay: function() {
    if( !this.state.isModalOpen ) return(<span />);

    // Render the modal when it's needed
    return (<QuerySaveModal onRequestHide={this.handleToggle} query={this.editor.getValue()} />);
  }
});

module.exports = QueryEditor;