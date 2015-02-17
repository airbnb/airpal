/** @jsx React.DOM */
var React = require('react');

/* ApiUtils */
var QueryApiUtils = require('../utils/QueryApiUtils');

/* Stores */
var UserStore   = require('../stores/UserStore'),
    QueryStore  = require('../stores/QueryStore');

function getStateFromStore() {
  return {
    queries: QueryStore.all()
  };
}

var MySavedQueries = React.createClass({
  displayName: 'MySavedQueries',

  getInitialState: function() {
    return getStateFromStore();
  },

  componentDidMount: function() {
    QueryStore.addStoreListener('change', this._onChange);
    UserStore.addStoreListener('change', this._onChange);

    // Make an API call to fetch the previous runs
    UserStore.addStoreListener('change', function() {
      QueryApiUtils.fetchUserQueries(UserStore.getCurrentUser());
    });
  },

  componentWillUnmount: function() {
    QueryStore.removeStoreListener('change');
    UserStore.removeStoreListener('change');
  },

  render: function () {
    console.log(this.state.queries);
    return (
      <table className="table table-condensed table-striped">
        <thead>
          <tr>
            <th>Query</th>
            <th>State</th>
            <th>Started</th>
            <th>Ended</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>{this.renderChildren()}</tbody>
      </table>
    );
  },

  renderChildren: function() {
    return this.renderEmptyMessage();
  },

  renderEmptyMessage: function() {
    return (
      <tr key="1" className="info">
        <td className="text-center" colSpan="5">No saved queries</td>
      </tr>
    );
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = MySavedQueries;