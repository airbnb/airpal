var React = require('react');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* Components */
var ConnectionErrors = require('./ConnectionErrors');
var Header = require('./Header');
var TableExplorer = require('./TableExplorer');
var QueryHistory = require('./QueryHistory');
var QueryEditor = require('./QueryEditor');
var UserStore = require('../stores/UserStore');
var UserApiUtils = require('../utils/UserApiUtils');
var SearchInputField = require('./SearchInputField');
var _ = require('lodash');

var commonSelectizeOptions = {
  closeAfterSelect: true,
};

function getStateFromStore() {
  return {
    user: UserStore.getCurrentUser()
  };
}

var AirpalApp = React.createClass({
  displayName: 'AirpalApp',

  getInitialState() {
    return getStateFromStore();
  },

  componentWillMount() {
    UserApiUtils.getCurrentUser();
  },

  componentWillUnmount() {
    UserStore.removeStoreListener('add');
  },

  componentDidMount: function() {
    UserStore.addStoreListener('add', this._onChange);
    // Add event listeners to the window to detect online/offline changes
    // for the user
    window.addEventListener('online',   function() { RunActions.wentOnline(); });
    window.addEventListener('offline',  function() { RunActions.wentOffline(); });
  },

  _onChange() {
    this.setState(getStateFromStore());
  },

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
          headers: ['Table', 'Usages', 'Last Updated']
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

  render: function () {
    var style = {
      backgroundColor: '#233240',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex'
    };

    var style2 = {
      display: 'flex',
      flex: 1,
      flexDirection: 'row'
    };

    var s1 = {
      width: 330,
      display: 'flex',
      backgroundColor: '#edefed',
      padding: 20,
      paddingTop: 10,
      color: '#565a5c',
      fontWeight: 'bold',
      flexDirection: 'column'
    };

    var s2 = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#111',
    };

    var s3 = {
      flex: 'initial',
      display: 'flex'
    };

    var s4 = {
      flex: 1,
      display: 'flex',
      backgroundColor: '#fff'
    };

    return (
      <div className='airpal-app' style={style}>
        <div style={style2}>
          <div style={s1}>
            <div style={{fontSize: 26, marginBottom: 15}} className='raleway'>
              AIRPAL
            </div>

            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                <div style={{fontSize: 12}}>
                  username
                </div>
                <div className='raleway'>
                  {this.state.user.name}
                </div>
              </div>
              <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                <div style={{fontSize: 12}}>
                  access level
                </div>
                <div className='raleway'>
                  {this.state.user.executionPermissions.accessLevel}
                </div>
              </div>
            </div>

            <SearchInputField
              placeholder="Select a table"
              selectizeOptions={this.tableSelectizeOptions} />

            <SearchInputField
              placeholder="Select a partition"
              selectizeOptions={this.tableSelectizeOptions} />

          </div>
          <div style={s2}>
            <div style={s3}>
              <QueryEditor />
            </div>
            <div style={s4}>
              <QueryHistory />
            </div>
          </div>
        </div>
      </div>
    );
    return (
      <div className="airpal-app">
        <ConnectionErrors />
        <Header />
        <TableExplorer />
        <div>
          <QueryEditor />
        </div>
        <QueryHistory />
      </div>
    );
  }
});

module.exports = AirpalApp;
