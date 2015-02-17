/** @jsx React.DOM */
var React   = require('react'),
    _       = require('lodash');

/* Actions */
var RunActions    = require('../actions/RunActions');

/* ApiUtils */
var RunApiUtils = require('../utils/RunApiUtils');

/* Components */
var MyOwnRunsRow = require('./MyOwnRunsRow.react');

/* Stores */
var RunStore  = require('../stores/RunStore'),
    UserStore = require('../stores/UserStore');

// State actions
function getStateFromStore() {
  return {
    runs: RunStore.where({ user: UserStore.getCurrentUser().name }, { sort: true })
  };
}

var MyOwnRuns = React.createClass({
  displayName: 'MyOwnQueries',

  getInitialState: function() {
    return getStateFromStore();
  },

  componentWillMount: function() {
    RunActions.connect();
  },

  componentDidMount: function() {
    RunStore.addStoreListener('change', this._onChange);

    // Make an API call to fetch the previous runs
    UserStore.addStoreListener('change', function() {
      RunApiUtils.fetch(UserStore.getCurrentUser());
    });
  },

  componentWillUnmount: function() {
    RunActions.disconnect(); // Close the SSE connection

    // Remove the store listeners
    RunStore.removeStoreListener('change');
    UserStore.removeStoreListener('change');
  },

  render: function () {
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
    if ( this.state.runs.length > 0 ) {
      return _.map(this.state.runs, function(model, index) {
        return (<MyOwnRunsRow key={index} model={model} />);
      });
    } else {
      return this.renderEmptyMessage();
    }
  },

  renderEmptyMessage: function() {
    return (
      <tr key="1" className="info">
        <td className="text-center" colSpan="5">No personal running queries</td>
      </tr>
    );
  },

  /* Store events */
  _onChange: function() {
    this.setState(getStateFromStore());
  }
});

module.exports = MyOwnRuns;
