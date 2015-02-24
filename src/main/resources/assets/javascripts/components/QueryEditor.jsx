var React = require('react');

/* Actions */
var RunActions      = require('../actions/RunActions');

/* Helpers */
var OverlayMixin    = require('react-bootstrap').OverlayMixin;
var _               = require('lodash');

/* Editor */
var ace             = require('brace');

/* Stores */
var QueryStore      = require('../stores/QueryStore');

/* Views */
var QuerySaveModal  = require('./QuerySaveModal');

require('brace/theme/monokai');
require('brace/mode/sql');

var QueryEditor = React.createClass({
  displayName: 'QueryEditor',
  mixins: [OverlayMixin],

  componentDidMount() {

    // Create the editor
    this.editor = ace.edit(this.refs.queryEditor.getDOMNode());

    // Set the theme and the mode
    this.editor.setTheme('ace/theme/monokai');
    this.editor.getSession().setMode('ace/mode/sql');

    // Listen to the selection event
    this.editor.selection.on('changeSelection', _.debounce(
      this.handleChangeSelection, 150, { maxWait: 150 }
    ));

    QueryStore.addStoreListener('add', this._hideModal);
    QueryStore.addStoreListener('select', this._selectQuery);
  },

  componentWillUnmount() {
    QueryStore.removeStoreListener('add', this._hideModal);
    QueryStore.removeStoreListener('select', this._selectQuery);
  },

  getInitialState() {
    return {
      isModalOpen: false,
      runText: 'query',
    };
  },

  render() {
    return (
      <div className='flex flex-column'>
        <div className='flex flex-column'>
          <div ref="queryContainer" className="editor-container flex clearfix">
            <pre ref="queryEditor" className="editor flex">
              SELECT COUNT(1) FROM users
            </pre>
            <div ref="handle" className="editor-resize-handles">
              <span className="glyphicon glyphicon-chevron-up editor-resize-handle"
                onClick={this.handleResizeShrink}
                title="Shrink Editor"></span>
              <span className="glyphicon glyphicon-chevron-down editor-resize-handle"
                onClick={this.handleResizeGrow}
                title="Grow Editor"></span>
            </div>
          </div>
        </div>

        <div className='flex'>
          <div className="flex flex-row query-menu-bar">
            <div className="flex" style={{justifyContent: 'flex-end'}}>
              <input ref="customName" type="text" name="custom-name" className="form-control flex"
                placeholder="Select a custom table name" />
              <div>
                  <button className="btn"
                    onClick={this.handleToggle}>
                      Save {this.state.runText}
                  </button>
                  <button className="btn"
                    onClick={this.handleRun}>
                      Run {this.state.runText}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderOverlay() {
    if (!this.state.isModalOpen) return <span />;

    // Render the modal when it's needed
    return (<QuerySaveModal onRequestHide={this.handleToggle} query={this._getQuery()} />);
  },

  // - Internal events ----------------------------------------------------- //
  handleToggle() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

  handleRun() {
    RunActions.execute({
      query: this._getQuery(),
      tmpTable: this._getCustomTableName()
    });
  },

  handleChangeSelection() {
    var range = this.editor.selection.getRange();

    // Define the text based on the current text range
    var text = ( !this._isRangeStartSameAsEnd(range) ) ? 'selection' : 'query';
    if ( text === this.state.runText ) return;

    // Update the state with the new runText
    this.setState({ runText: text });
  },

  handleResizeShrink($event) {
    this._resizeEditor(-120);
  },

  handleResizeGrow($event) {
    this._resizeEditor(120);
  },

  // - Internal helpers ---------------------------------------------------- //

  // Resizes the editor based on the given pixels
  // @param {integer} the amount of pixels to increase/decrease the editor
  _resizeEditor(pixels) {

    // Get the editor by className
    var $el = $(this.refs.queryEditor.getDOMNode());

    // Animate the editor height
    $el.animate({
      height: $el.height() + pixels },
      {
        duration: 300,

        // Notify the AceEditor on completion that it has resized
        complete: function() {
          this.editor.resize(true);
        }.bind(this)
      }
    );
  },

  // Retrieves the current query
  // @return {string} the query string
  _getQuery() {
    var query;
    var range = this.editor.selection.getRange();

    // Define the current query
    if (!this._isRangeStartSameAsEnd(range)) {
      query = this.editor.session.getTextRange(range);
    } else {
      query = this.editor.getValue();
    }

    // Return the query value
    return query;
  },

  // Retrieves the custom table name
  // @return {string} the custom table name
  _getCustomTableName() {
    var customTableName = this.refs.customName.getDOMNode().value;
    return !_.isEmpty(customTableName) ? customTableName : null;
  },

  // Checks or there is currently something selected
  // @return {boolean} is the start equal to the end of the selection
  _isRangeStartSameAsEnd(range) {
    var start = range.start,
        end   = range.end;

    // Return of the start equals the end of the selection
    return !!start && !!end &&
      (start.row === end.row) &&
      (start.column === end.column);
  },

  // Hides the modal when a change is triggered
  _hideModal() {
    this.setState({ isModalOpen: false });
  },

  // Populate the editor with a given query.
  _selectQuery() {
    var selectedQuery = QueryStore.getSelectedQuery();
    this.editor.setValue(selectedQuery);
  }
});

module.exports = QueryEditor;
