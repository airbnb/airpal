/** @jsx React.DOM */
var React = require('react');

/* Components */
var SearchInputField = require('./SearchInputField.react');

/* Actions */
var TableActions = require('../actions/TableActions');

/* Header component */
var TableSearch = React.createClass({
  displayName: 'TableSearch',
  render: function () {
    return (
      <section className="row table-search-row">
        <div className="col-sm-12">
          <div className="row">

            <form className="col-sm-7" role="form">
              <div className="form-group">
                <label htmlFor="tables-input">Tables:</label>
                <SearchInputField placeholder="Select a table" selectizeOptions={this.tableSelectizeOptions} />
              </div>
            </form>

            <form className="col-sm-5" role="form">
              <div className="form-group">
                <label htmlFor="tables-input">Partition:</label>
                <SearchInputField placeholder="Select a partition" disabled="true" selectizeOptions={this.partitionSelectizeOptions} />
              </div>
            </form>

          </div>
        </div>
      </section>
    );
  },

  /* - Selectize options --------------------------------------------------- */
  tableSelectizeOptions: function() {
    return {
      preload: true,
      render: { option: this._renderTableOptions },
      valueField: 'fqn',
      labelField: 'fqn',
      sortField: [{
        field: 'usages',
        direction: 'desc',
      }],
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
          success: function(res) {
            callback(res);
          }
        });
      },

      onItemAdd: function(table, $element) {
        TableActions.addTable({ name: table });
      }.bind(this),

      onItemRemove: function(table) {
        TableActions.removeTable(table);
      }.bind(this),

      onItemSelected: function(element) {
        TableActions.selectTable($(element).data('value'));
      }.bind(this)
    };
  },

  _renderTableOptions: function(item, escape) {
    return (
      '<div class="row">' +
        '<div class="col-sm-6"><p>' + escape(item.fqn) + '</p></div>' +
        '<div class="col-sm-3"><p>' + escape(item.usages) + '</p></div>' +
      '</div>'
    );
  },

  partitionSelectizeOptions: function() {
    return {};
  }
});

module.exports = TableSearch;
