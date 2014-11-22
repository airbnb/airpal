/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
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
  componentWillMount: function() {
    //this.props.emitter.on('query:update', function(data) {
      //console.log('[PreviewQuery#query:update]', data, this, arguments);
      //if (data && data.job && (data.job.uuid === this.props.activeQuery)) {
        //var newData = data;
        //if (_.isEmpty(data.sample)) {
          //newData = _.extend({}, data, {
            //sample: !!this.state.previewData ? this.state.previewData.sample : [],
          //});
        //}
        //this.setState({
          //previewData: newData,
        //});
      //}
    //}.bind(this));
  },
  render: function() {
    var headers, rows, data;

    if (_.isEmpty(this.state.previewData)) {
      return (<h2>No active query</h2>);
    }

    data = this.state.previewData;

    headers = _.map(data.job.columns, function(col) {
      return {
        className: 'preview-query-' + col.name,
        label: col.name,
        width: 200,
        render: function(row) {
          return row[data.job.columns.indexOf(col)];
        }.bind(this),
      };
    }.bind(this));

    return (<div className="scroll-table-container" id="preview-grid">
      <ScrollableTable
        uuid={rowUuid}
        columns={headers}
        noScroll={true}
        data={data.sample} />
    </div>);
  },
});

module.exports = PreviewQuery;
