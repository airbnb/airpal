/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    ScrollableTable = require('./scrollable_table'),
    EventEmitter = require('events').EventEmitter,
    GridOpts = require('../util').GridOpts,
    Highlighter = require('./highlighter'),
    PreviewQuery;

function rowUuid(row, rowIdx) {
  return 'preview-query-row-' + rowIdx;
}

PreviewQuery = React.createClass({
  getInitialState: function() {
    return {
      previewData: this.props.previewData,
    };
  },
  getDefaultProps: function() {
    return {
      activeQuery: null,
      emitter: new EventEmitter(),
      previewData: null,
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return _.isEmpty(this.state.previewData) ||
      !((this.state.previewData.job.uuid === nextState.previewData.job.uuid) &&
        (this.state.previewData.sample.length === nextState.previewData.sample.length));
  },
  componentDidMount: function() {
    this.grid = new Slick.Grid(this.refs.grid.getDOMNode(), [], [], GridOpts({fullWidthRows: true}));
  },
  render: function() {
    var headers, rows, data, isEmpty, queryToPreview;

    isEmpty = _.isEmpty(this.state.previewData);

    if (this.state && this.state.previewData && this.state.previewData.job && this.state.previewData.job.query) {
      queryToPreview = this.state.previewData.job.query;
    }

    console.log('RENDER CALLED', 'isEmpty', isEmpty);

    return (<div>
      <h2 className={isEmpty ? '' : 'hide'}>No active query</h2>
      <div className={isEmpty ? 'hide' : ''}>
        <Highlighter query={queryToPreview} />
      </div>
      <div className={isEmpty ? 'empty' : ''}>
        <div ref="grid" id="preview-grid" />
      </div>
    </div>);
  },
  handleSSEEvent: function(message) {
    console.log('preview saw message', _.clone(message));
    console.log('sample?', message.sample);

    var dataObjs, cols, columns;

    if (!_.isEmpty(message) && !_.isEmpty(message.sample) && !!this.grid) {
      console.log('updating state');
      this.setState({
        previewData: message,
      });

      columns = message.job.columns;

      dataObjs = _.map(message.sample, function(row) {
        return _.reduce(row, function(memo, value, i) {
          memo[columns[i].name] = value;
          return memo;
        }, {});
      });

      cols = _.map(columns, function(col, i) {
        return {
          name: col.name,
          field: col.name,
          id: i,
          minWidth: 50,
          maxWidth: 140
        };
      });

      this.grid.setColumns(cols);
      this.grid.setData(dataObjs);
      this.grid.invalidate();
    }
  },
});

module.exports = PreviewQuery;
