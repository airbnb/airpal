/** @jsx React.DOM */

var React = require('react'),
    _ = require('lodash'),
    Fqn = require('../fqn'),
    moment = require('moment'),
    SelectizeInput = require('./selectize_input'),
    PartitionSelector;

PartitionSelector = React.createClass({
  getInitialState: function() {
    return {
      activeTable: null
    };
  },
  getDefaultProps: function() {
    return {
      onItemAdd: function(value) {},
      onItemRemove: function(value) {},
      selectizeOpts: {
        valueField: 'value',
        labelField: 'fqn',
        searchField: [
          'value',
          'name',
          'fqn'
        ],
        sortField: [
          {field: 'value', direction: 'desc'},
          {field: 'name', direction: 'asc'}
        ],
        loadThrottle: 25,
        placeholder: 'No table selected',
        plugins: {
          'remove_button': {},
          'header': {
            className: 'selectize-header-partitions',
            headers: [
              'Partition',
              'Last Updated'
            ]
          },
        }
      },
    };
  },
  render: function() {
    return (<form className="col-sm-5">
      <div className="control-group">
        <label className="label-large">Partition</label>
        <SelectizeInput
          ref="selectize"
          selectize={this.props.selectizeOpts}
          onLoad={this.onLoad}
          onItemAdd={this.onItemAdd}
          onItemRemove={this.onItemRemove}
          onOptionRender={this.onOptionRender} />
      </div>
    </form>);
  },
  onOptionRender: function(item, escape) {
    var template = '<div class="clearfix partition-row">' +
      '<div class="row0">' + escape(item.fqn) +
      '</div>' +
      (!!item.lastUpdated ?
       '<div class="row1">' + escape(moment(new Date(item.lastUpdated)).format('MMM Do YYYY, h:mm:ss a z')) + '</div>' :
       '') +
      '</div>';

    return template;
  },
  onLoad: function(query, callback) {
    if (!this.state.activeTable) {
      this.refs.selectize.updatePlaceholder('No table selected');
      this.refs.selectize.disable();
      return callback();
    }
    var schema = Fqn.schema(this.state.activeTable),
        table = Fqn.table(this.state.activeTable),
        url = '/api/table/' + schema + '/' + table + '/partitions';

    $.ajax({
      url: url,
      type: 'GET',
    }).done(function(res) {
      var selectize = this.refs.selectize;

      if (_.isEmpty(res)) {
        selectize.updatePlaceholder('No partitions for selected table');
        selectize.disable();
        callback();
      } else {
        selectize.updatePlaceholder(' ');
        selectize.enable();
        callback($.map(res, function(r, i) {
          return $.extend({
            fqn: [r.name, r.value].join('=')
          }, r);
        }));
      }
    }.bind(this)).fail(function() {
      callback();
    });
  },
  componentWillUpdate: function(nextProps, nextState) {
  },
  onItemAdd: function(value, $item) {
    var schema = Fqn.schema(value),
        table = Fqn.table(value);

    this.props.onItemAdd(value);
  },
  onItemRemove: function(value, $item) {
    var schema = Fqn.schema(value),
        table = Fqn.table(value);

    this.props.onItemRemove(value);
  },
});

module.exports = PartitionSelector;
