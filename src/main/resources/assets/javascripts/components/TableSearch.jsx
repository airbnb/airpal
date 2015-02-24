var React = require('react');

/* Components */
var SearchInputField = require('./SearchInputField');

/* Actions */
var TableActions = require('../actions/TableActions');

/* Stores */
var TableStore = require('../stores/TableStore');

var _ = require('lodash');
var moment = require('moment');

var commonSelectizeOptions = {
  closeAfterSelect: true,
};

function getActiveItemName(selectize) {
  var activeItems = selectize.$activeItems;

  if (!!activeItems && !!activeItems.length) {
    return $(activeItems[0]).data('value');
  } else {
    return null;
  }
}

// State actions
function getStateFromStore() {
  return {
    table: TableStore.getActiveTable(),
  };
}

function highlightOnlyOption(selectize, item) {
  var items = selectize.$control.find('.item');

  if (items.length == 1) {
    selectize.setActiveItem(items[0]);
  } else if (!_.isEmpty(item)) {
    selectize.setActiveItem(item[0]);
  }
}

/* Header component */
var TableSearch = React.createClass({
  displayName: 'TableSearch',

  componentDidMount() {
    TableStore.addStoreListener('select', this._onChange);
    TableStore.addStoreListener('change', this._onChange);
  },

  componentWillUnmount() {
    TableStore.removeStoreListener('select');
    TableStore.removeStoreListener('change');
  },

  getInitialState() {
    return getStateFromStore();
  },

  render() {
    var partitionPlaceholder;
    var partitionsDisabled = true;

    if (_.isEmpty(this.state.table)) {
      partitionPlaceholder = "No table selected";
    } else if (_.isEmpty(this.state.table.partitions)) {
      partitionPlaceholder = "Table has no partitions";
    } else {
      partitionPlaceholder = "Select a partition";
      partitionsDisabled = false;
    }

    return (
      <section className="row table-search-row">
        <div>
          <form className="col-sm-7" role="form">
            <div className="form-group">
              <SearchInputField
                placeholder="Select a table"
                selectizeOptions={this.tableSelectizeOptions} />
            </div>
          </form>
          <form className="col-sm-5" role="form">
            <div className="form-group">
              <SearchInputField
                placeholder={partitionPlaceholder}
                disabled={partitionsDisabled}
                selectizeOptions={this.partitionSelectizeOptions} />
            </div>
          </form>
        </div>
      </section>
    );
  },

  /* - Selectize options --------------------------------------------------- */
  tableSelectizeOptions() {
    return _.extend({}, commonSelectizeOptions, {
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
          headers: ['Table', 'Usages in Airpal']
        },
      },

      load(query, callback) {
        $.ajax({
          url: './api/table',
          type: 'GET',

          error() { callback(); },
          success(res) {
            callback(res);
          }
        });
      },

      onItemAdd(table, $element) {
        TableActions.addTable({ name: table });
        highlightOnlyOption(this, $element);
      },

      onItemRemove(table) {
        TableActions.removeTable(table);
        highlightOnlyOption(this);
      },

      onItemSelected(element) {
        var $el = $(element);
        TableActions.selectTable($(element).data('value'));
      },

      onOptionActive($activeOption) {
        var itemName = getActiveItemName(this);

        if ($activeOption == null) {
          TableActions.unselectTable(itemName)
        } else {
          if (!TableStore.containsTable(itemName)) {
            TableActions.unselectTable(itemName);
          } else {
            TableActions.selectTable(itemName);
          }
        }
      },
    });
  },

  _renderTableOptions(item, escape) {
    return (
      '<div class="row">' +
        '<div class="col-sm-6 col-name"><span>' + escape(item.fqn) + '</span></div>' +
        '<div class="col-sm-3"><span>' + escape(item.usages) + '</span></div>' +
      '</div>'
    );
  },

  _renderPartitionOptions(item, escape) {
    var lastUpdatedRepresentation = '';

    if (item.lastUpdated != null) {
      lastUpdatedRepresentation = moment(item.lastUpdated).
        format('MMM Do YYYY, h:mm:ss a z');
    }

    return (
      '<div class="row">' +
        '<div class="col-sm-6 col-name"><span>' +
          escape(item.name + '=' + item.value) +
        '</span></div>' +
      '</div>'
    );
  },

  partitionSelectizeOptions() {
    var partitions = [];
    if (!_.isEmpty(this.state.table)) {
      partitions = this.state.table.partitions;
    }

    return _.extend({}, commonSelectizeOptions, {
      preload: 'focus',
      openOnFocus: true,
      valueField: 'value',
      labelField: 'value',
      searchField: [
        'value',
      ],
      sortField: [
        {field: 'value', direction: 'desc'},
        {field: 'name', direction: 'asc'}
      ],
      plugins: {
        'remove_button': {},
      },
      render: { option: this._renderPartitionOptions },
      load(query, callback) {
        // Call it async consistently
        _.defer(function() {
          callback(partitions);
        });
      },
    });
  },

  _onChange() {
    this.setState(getStateFromStore());
  },
});

module.exports = TableSearch;
