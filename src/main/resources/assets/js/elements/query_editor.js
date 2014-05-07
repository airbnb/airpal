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
    return {
    };
  },
  componentDidMount: function() {
    var editor = ace.edit(this.refs.editor.getDOMNode());

    editor.setTheme(this.props.theme);
    editor.getSession().setMode(this.props.mode);

    editor.selection.on('changeSelection',
                        _.debounce(this.handleSelectionChange,
                                   this.props.selectionBounce,
                                   { maxWait: this.props.selectionBounce }));

    this.editor = editor;
  },
  render: function() {
    return <div ref="container" className="query-editor">
      <pre ref="editor" id="query-input">{this.props.defaultQuery}</pre>
      <div
        ref="handle"
        id="resize-handle">
        <i className="icon icon-caret-up"
           onClick={this.handleShrinkEditor}
           title="Shrink Editor"></i>
        <i className="icon icon-caret-down"
           onClick={this.handleGrowEditor}
           title="Grow Editor"></i>
      </div>
    </div>;
  },
  increaseEditorSize: function(pixels) {
    var $el = $(this.refs.editor.getDOMNode());
    $el.css({height: $el.height() + pixels});
    this.editor.resize(true);
  },
  handleShrinkEditor: function(e) {
    this.increaseEditorSize(-120);
  },
  handleGrowEditor: function(e) {
    this.increaseEditorSize(120);
  },
  getValue: function() {
    return this.editor.getValue();
  },
  setValue: function(value) {
    return this.editor.setValue(value);
  },
  getQuery: function() {
    var range = this.editor.selection.getRange(),
        rangeSelected = !rangeStartEndSame(range.start, range.end);

    if (rangeSelected) {
      return this.editor.session.getTextRange(range);
    } else {
      return this.getValue();
    }
  },
  handleSelectionChange: function(evt, selection) {
    var range = selection.getRange(),
        rangeSelected = !rangeStartEndSame(range.start, range.end);

    this.props.onSelection(rangeSelected, this.getQuery());
  },
});

module.exports = QueryEditor;
