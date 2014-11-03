/** @jsx React.DOM */
var React           = require('react'),
    SelectizeInput  = require('./selectize_input'),
    moment          = require('moment');

var TableSelector = React.createClass({
  displayName: 'TableSelector',

  render: function() {
    return (
      <form className="col-sm-7" role="form">
        <div className="form-group">
          <label htmlFor="tables-input">Tables</label>
          <SelectizeInput
            ref="selectize"
            placeholder="Select a table..."
            selectizeOptions={this._selectizeOptions}
            onSelectItem={this.props.onItemAdd} />
        </div>
      </form>
    );
  },

  /* Internal Helpers ------------------------------------------------------- */
  _selectizeOptions: function() {
    return {
      preload: true,
      render: { option: this._renderOptions },
      valueField: 'fqn',
      labelField: 'fqn',
      searchField: ['fqn', 'tableName', 'schema'],
      plugins: {
        'remove_button': {},
        'header': {
          headers: ['Table', 'Usages', 'Last Updated']
        }
      },

      load: function(query, callback) {
        $.ajax({
          url: './api/table',
          type: 'GET',

          error: function() { callback(); },
          success: function(res) { callback(res); }
        });
      },

      onItemAdd: function(table, $element) {
        Mediator.emit('addSearchItem', table, $element, 'table');
        this.refs.selectize.close();
      }.bind(this),

      onItemRemove: function(table) {
        Mediator.emit('removeSearchItem', table, 'table');
        this.refs.selectize.close();
      }.bind(this),

      onItemSelected: function($element) {
        Mediator.emit('selectSearchItem', $element, 'table');
        this.refs.selectize.close();
      }.bind(this)
    };
  },

  _renderOptions: function(item, escape) {
    return (
      '<div class="row">' +
        '<div class="col-sm-6"><p>' + escape(item.fqn) + '</p></div>' +
        '<div class="col-sm-3"><p>' + escape(item.usages) + '</p></div>' +
        ( item.lastUpdated !== null ? '<div class="col-sm-3"><p>' + escape(moment(new Date(item.lastUpdated)).format('MMM Do YYYY, h:mm:ss a z')) + '</p></div>' : '' ) +
      '</div>'
    );
  }

});

module.exports = TableSelector;
