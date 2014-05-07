/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    GridOpts = require('../util').GridOpts,
    PreviewTable;

function rowUuid(row, rowIdx) {
  return 'preview-row-' + rowIdx;
}

PreviewTable = React.createClass({
  getDefaultProps: function() {
    return {
      schema: null,
      table: null,
      partition: null,
    };
  },
  getInitialState: function() {
    return {
      columns: [],
      rows: [],
    };
  },
  componentWillReceiveProps: function(nextProps) {
    var baseUrl = '/api/table/' + nextProps.schema + '/' + nextProps.table,
        columnsInfo, preview;

    if (!(nextProps.schema && nextProps.table)) {
      this.setState({
        columns: [],
        row: [],
      });
      this.grid.setColumns([]);
      this.grid.setData([]);
      this.grid.invalidate();
      return;
    } else if ((nextProps.schema === this.props.schema) &&
         (nextProps.table === this.props.table)) {
      return;
    }

    columnsInfo = $.ajax({
      url: baseUrl + '/columns',
      type: 'GET'
    });

    preview = $.ajax({
      url: baseUrl + '/preview',
      type: 'GET'
    });

    $.when(columnsInfo, preview).done(function(colData, previewData) {
      var data = previewData[0],
          columns = colData[0],
          dataObjs, cols;

      var dataObjs, cols;
      this.setState({
        columns: columns,
        rows: data,
      });


      dataObjs = _.map(data, function(row) {
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

    }.bind(this));
  },
  componentDidMount: function() {
    this.grid = new Slick.Grid(this.refs.historyGrid.getDOMNode(), [], [], GridOpts({fullWidthRows: true}));
  },
  render: function() {
    var isEmpty = _.isEmpty(this.state.columns);
    return (<div>
      <h2 className={isEmpty ? '' : 'hide'}>No table selected</h2>
      <div className={isEmpty ? 'empty' : ''}>
        <div ref="historyGrid" id="history-grid" />
      </div>
    </div>);
  },
});

module.exports = PreviewTable;
