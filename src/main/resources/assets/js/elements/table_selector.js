/** @jsx React.DOM */

var React = require('react'),
    Fqn = require('../fqn'),
    SelectizeInput = require('./selectize_input'),
    moment = require('moment'),
    TableSelector;

TableSelector = React.createClass({
  getDefaultProps: function() {
    return {
      onItemAdd: function(value) {},
      onItemRemove: function(value) {},
      onOptionActive: function(value) {},
      selectizeOpts: {
        valueField: 'fqn',
        labelField: 'fqn',
        searchField: [
          'fqn',
          'tableName',
          'schema'
        ],
        sortField: [
          {field: 'usages', direction: 'desc'},
          {field: 'tableName', direction: 'asc'},
          {field: 'schema', direction: 'asc'}
        ],
        plugins: {
          'remove_button': {},
          'header': {
            className: 'selectize-header-rows',
            headers: [
              'Table',
              '<div class="header-tip" data-behavior="tooltip" data-position="top" id="tbl-usages-header">Usages</div>',
              'Last Updated'
            ]
          },
        }
      },
    };
  },
  render: function() {
    return (<form className="col-sm-7">
      <div className="control-group">
        <label className="label-large" for="tables-input">Tables</label>
        <SelectizeInput
          ref="selectize"
          selectize={this.props.selectizeOpts}
          onLoad={this.onLoad}
          onItemAdd={this.onItemAdd}
          onItemRemove={this.onItemRemove}
          onOptionActive={this.onOptionActive}
          onOptionRender={this.onOptionRender} />
      </div>
    </form>);
  },
  onOptionRender: function(item, escape) {
    var template = '<div class="clearfix table-row">' +
      '<div class="row0">' + escape(item.fqn) + '</div>' +
      '<div class="row1">' + escape(item.usages) +
      '</div>' +
      (!!item.lastUpdated ?
       '<div class="row2">' + escape(moment(new Date(item.lastUpdated)).format('MMM Do YYYY, h:mm:ss a z')) + '</div>' :
       '') +
      '</div>';

    return template;
  },
  onLoad: function(query, callback) {
    $.ajax({
      url: '/api/table',
      type: 'GET',

      success: function(results) {
        callback(results);
      }
    });
  },
  onItemAdd: function(value, $item) {
    var schema = Fqn.schema(value),
        table = Fqn.table(value);

    this.highlightOnlyOption();
    this.props.onItemAdd(value);
  },
  onItemRemove: function(value, $item) {
    var schema = Fqn.schema(value),
        table = Fqn.table(value);

    this.highlightOnlyOption();
    this.props.onItemRemove(value);
  },
  onOptionActive: function($item) {
    this.props.onOptionActive($item);
  },
  highlightOnlyOption: function() {
    var selectize = this.refs.selectize,
        items = selectize.getItems();

    //console.log('highlightOnlyOption', selectize, items);
    if (items.length == 1) {
      selectize.setActiveItem(items[0]);
    }
  },
});

module.exports = TableSelector;
