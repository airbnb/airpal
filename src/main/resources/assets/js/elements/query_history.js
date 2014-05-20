/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    Modal = require('../lib/o2/o2').Modal,
    EventEmitter = require('events').EventEmitter,
    Formatters = require('../slick_formatters'),
    models = require('../models'),
    ExecutionHistory = models.ExecutionHistory,
    GridOpts = require('../util').GridOpts,
    QueryHistory,
    gridColumns;

function jobIsFailed(job) {
  return job.state && (job.state.toLowerCase() === 'failed');
}

function jobOutputIsHiveTable(job) {
  return job.output &&
    job.output.location &&
    (job.output.location.indexOf('.csv') == -1);
}

gridCols = [
  {
    name: 'User',
    field: 'user',
    id: 1,
    width: 50
  },
  {
    name: 'Query',
    field: 'query',
    id: 2,
    width: 338,
    formatter: Formatters.Query
  },
  {
    name: 'Time (s)',
    field: 'queryStats',
    id: 4,
    width: 70,
    formatter: Formatters.TimeTaken
  },
  {
    name: 'Status',
    field: 'state',
    id: 5,
    width: 80,
    formatter: Formatters.JobStatus
  },
  {
    name: 'Finished',
    field: 'queryFinished',
    id: 6,
    width: 160,
    formatter: Formatters.DateTime
  },
  {
    name: 'Output',
    field: 'output',
    id: 7,
    width: 220,
    formatter: Formatters.Output,
    cssClass: 'output-cell'
  }
];

function QueryData() {
  this.dataList = [];
  this.indexes = {};
}

QueryData.prototype.get = function(idx) {
  if (!!this.dataList[idx]) {
    return this.dataList[idx];
  } else {
    return {};
  }
}

QueryData.prototype.getAll = function() {
  return this.dataList.concat();
}

QueryData.prototype.loadData = function(data) {
  this.dataList = data;
  this.updateIndexes();
}

QueryData.prototype.updateIndexes = function() {
  var that = this;
  _.reduce(this.dataList, function(memo, el) {
    that.indexes[el.uuid] = memo;
    return memo + 1;
  }, 0);
}

QueryData.prototype.update = function(element) {
  if (_.has(this.indexes, element.uuid)) {
    this.dataList[this.indexes[element.uuid]] = element;
  } else {
    this.dataList.splice(0, 0, element);
    this.updateIndexes();
  }
}

QueryHistory = React.createClass({
  getInitialState: function() {
    return {
      history: {},
    };
  },
  getDefaultProps: function() {
    return {
      onQuerySelected: function() {},
      onTableSelected: function() {},
      emitter: new EventEmitter(),
    };
  },
  componentWillMount: function() {
  },
  render: function() {
    var that = this,
        columns;

    return (<div>
      <div ref="historyGrid" id="history-grid" />
    </div>);
  },
  componentDidMount: function() {
    this.queryData = new QueryData();
    this.historyData = new ExecutionHistory();
    this.grid = new Slick.Grid(this.refs.historyGrid.getDOMNode(),
                               this.historyData,
                               gridCols,
                               GridOpts({}));

    this.historyData.on('update', function(idx) {
      this.grid.invalidateRow(idx[0]);
      this.grid.render();
    }.bind(this)).on('replace', function() {
      this.grid.invalidate();
    }.bind(this));

    $.ajax({
      url: '/api/query/history',
      type: 'GET',
      error: function() {},
      success: function(res) {
        var history = res.reduce(function(memo, row) {
          memo[row.uuid] = row;
          return memo;
        }, {});

        this.historyData.replace(_.uniq(res, false, function(el) {
          return el.uuid;
        }));

        this.setState({
          history: history,
        });
      }.bind(this)
    });

    $(this.getDOMNode()).on('click', '.job-query', function(e) {
      var $el = $(e.currentTarget),
          row = parseInt($el.data('row'));

      this.handleQueryClick(this.historyData.getItem(row), e);
    }.bind(this)).on('click', '.output-cell', function(e) {
      var $el = $(e.target),
          row = parseInt($el.data('row'));

      this.handleOutputClick(this.historyData.getItem(row), e);
    }.bind(this));
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },
  handleQueryClick: function(job, e) {
    e.preventDefault();
    this.props.onQuerySelected(job.query);
  },
  handleOutputClick: function(job, e) {
    var $target = $(e.target);

    if (jobIsFailed(job) || jobOutputIsHiveTable(job)) {
      e.preventDefault();
    }

    if (jobIsFailed(job)) {
      this.props.onErrorSelected(job);
    } else if (jobOutputIsHiveTable(job)) {
      this.props.onTableSelected($target.text());
    }
  },
  handleSSEEvent: function(message, job) {
    this.historyData.update(job);
  },
});

module.exports = QueryHistory;

