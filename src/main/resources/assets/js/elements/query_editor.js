/** @jsx React.DOM */
var React = require('react'),
    ace = require('brace'),
    _ = require('lodash'),
    Placeholder = ace.acequire('ace/placeholder').PlaceHolder,
    Range = ace.acequire('ace/range').Range,
    QueryEditor;

require('brace/theme/monokai');
require('brace/mode/sql');

function rangeStartEndSame(start, end) {
  return !!start && !!end &&
    (start.row === end.row) &&
    (start.column === end.column);
}

QueryEditor = React.createClass({

  getDefaultProps: function() {
    return {
      theme: 'ace/theme/monokai',
      mode: 'ace/mode/sql',
      selectionBounce: 150,
      onSelection: function(isRange, text) {},
    }
  },

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {

    // Create the editor
    this.editor = ace.edit(this.refs.editor.getDOMNode());

    // Set the theme for the editor
    this.editor.setTheme(this.props.theme);
    this.editor.getSession().setMode(this.props.mode);

    // Listen to the selection event on the editor
    this.editor.selection.on(
      'changeSelection',
      _.debounce(
        this.handleSelectionChange,
        this.props.selectionBounce,
        { maxWait: this.props.selectionBounce }
      )
    );
  },

  render: function() {
    return (
      <div ref="container" className="query-editor">
        <pre ref="editor" className="query-input">
          {this.props.defaultQuery}
        </pre>

        <div ref="handle" className="resize-handle">
          <span className="glyphicon glyphicon-chevron-up white" onClick={this.handleShrinkEditor} title="Shrink Editor"></span>
          <span className="glyphicon glyphicon-chevron-down white" onClick={this.handleGrowEditor} title="Grow Editor"></span>
        </div>
      </div>
    );
  },

  /* Event Handlers --------------------------------------------------------- */
  handleShrinkEditor: function(e) {
    this._increaseEditorSize(-120);
  },

  handleGrowEditor: function(e) {
    this._increaseEditorSize(120);
  },

  handleSelectionChange: function(evt, selection) {
    var range = selection.getRange(),
        rangeSelected = !rangeStartEndSame(range.start, range.end);

    this.props.onSelection(rangeSelected, this._getQuery());
  },

  /* Internal Helpers ------------------------------------------------------- */
  _getValue: function() { return this.editor.getValue(); },

  _setValue: function(value) { return this.editor.setValue(value); },

  _getQuery: function() {
    var range = this.editor.selection.getRange(),
        rangeSelected = !rangeStartEndSame(range.start, range.end);

    if (rangeSelected) {
      return this.editor.session.getTextRange(range);
    } else {
      return this._getValue();
    }
  },

  _increaseEditorSize: function(pixels) {
    var $el = $(this.refs.editor.getDOMNode());
    $el.css({height: $el.height() + pixels});
    this.editor.resize(true);
  },
});

module.exports = QueryEditor;
